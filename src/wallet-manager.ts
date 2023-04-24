import { EventEmitter } from 'stream';

import { Registry } from 'prom-client';

import { getSilentLogger, Logger } from './utils';
import { PrometheusExporter } from './prometheus-exporter';
import { SingleWalletManager, WalletExecuteOptions, WithWalletExecutor, WalletBalancesByAddress } from "./single-wallet-manager";
import { ChainName, isChain, KNOWN_CHAINS, WalletBalance, WalletConfig } from './wallets';

type WalletManagerChainConfig = {
  network?: string;
  chainConfig?: any;
  rebalance?: {
    enabled: boolean;
    strategy?: string;
    interval?: number;
    minBalanceThreshold?: number;
  };
  wallets: WalletConfig[];
}

export type WalletManagerConfig = Record<string, WalletManagerChainConfig>;

export type WalletManagerOptions = {
  logger?: Logger;
  balancePollInterval?: number;
  metrics?: {
    enabled: boolean;
    port?: number;
    path?: string;
    registry?: Registry
    serve?: boolean;
  };
};

function getDefaultNetwork(chainName: ChainName) {
  return KNOWN_CHAINS[chainName].defaultNetwork;
}

export class WalletManager {
  private emitter: EventEmitter = new EventEmitter();
  private managers: Record<ChainName, SingleWalletManager>;
  private exporter?: PrometheusExporter;

  protected logger: Logger;

  constructor(rawConfig: WalletManagerConfig, options?: WalletManagerOptions) {
    this.logger = options?.logger || getSilentLogger();
    this.managers = {} as Record<ChainName, SingleWalletManager>;

    if (options?.metrics?.enabled) {
        const { port, path, registry } = options.metrics;
        this.exporter = new PrometheusExporter(port, path, registry);
        if (options.metrics?.serve) this.exporter.startMetricsServer();
    }
    
    for (const [chainName, config] of Object.entries(rawConfig)) {
      if (!isChain(chainName)) throw new Error(`Invalid chain name: ${chainName}`);
      const network = config.network || getDefaultNetwork(chainName);

      const chainManagerConfig = {
        network,
        chainName,
        logger: this.logger,
        rebalance: config.rebalance,
        walletOptions: config.chainConfig,
        balancePollInterval: options?.balancePollInterval,
      };

      const chainManager = new SingleWalletManager(chainManagerConfig, config.wallets);

      chainManager.on('error', (...args: any[]) => {
        this.emitter.emit('error', chainName, ...args);
      });

      chainManager.on('balances', (balances: WalletBalance[], previousBalances: WalletBalance[]) => {
        this.logger.info(`Balances updated for ${chainName} ${network} -> ` + JSON.stringify(balances));
        this.exporter?.updateBalances(chainName, network, balances);
        
        this.emitter.emit('balances', chainName, network, balances, previousBalances);
      });

      this.managers[chainName] = chainManager;

      chainManager.start();
    };
  }

  public stop() {
    Object.values(this.managers).forEach((manager) => manager.stop());
  }

  public on(event: string, listener: (...args: any[]) => void) {
    this.emitter.on(event, listener);
  }

  public metrics() {
    return this.exporter?.metrics();
  }

  public getRegistry() {
    return this.exporter?.getRegistry();
  }

  public withWallet(chainName: ChainName, fn: WithWalletExecutor, opts?: WalletExecuteOptions): Promise<void> {
    const chainManager = this.managers[chainName];
    if (!chainManager) throw new Error(`No wallets configured for chain: ${chainName}`);

    return chainManager.withWallet(fn, opts);
  }

  public getAllBalances(): Record<string, WalletBalancesByAddress> {
    const balances: Record<string, WalletBalancesByAddress> = {};

    for (const [chainName, manager] of Object.entries(this.managers)) {
      balances[chainName] = manager.getBalances();
    }

    return balances;
  }

  public getChainBalances(chainName: ChainName): WalletBalancesByAddress {
    const manager = this.managers[chainName];
    if (!manager) throw new Error(`No wallets configured for chain: ${chainName}`);

    return manager.getBalances();
  }
}
