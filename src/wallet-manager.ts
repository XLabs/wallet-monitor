import { EventEmitter } from 'stream';

import winston from 'winston';
import { Registry } from 'prom-client';
import { createLogger } from './utils';
import { PrometheusExporter } from './prometheus-exporter';
import { SingleWalletManager, WalletExecuteOptions, WithWalletExecutor, WalletBalancesByAddress } from "./single-wallet-manager";
import { ChainName, isChain, KNOWN_CHAINS, WalletBalance, WalletConfig } from './wallets';
import {TransferRecepit, WalletInterface} from './wallets/base-wallet';
import { RebalanceInstruction } from './rebalance-strategies';

type WalletManagerChainConfig = {
  network?: string;
  chainConfig?: any;
  rebalance?: {
    enabled: boolean;
    strategy?: string;
    interval?: number;
    minBalanceThreshold?: number;
    maxGasPrice?: number;
    gasLimit?: number;
  };
  wallets: WalletConfig[];
}

export type WalletManagerConfig = Record<string, WalletManagerChainConfig>;

export type WalletManagerOptions = {
  logger?: any;
  logLevel?: 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'silent';
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

  protected logger: winston.Logger;

  constructor(rawConfig: WalletManagerConfig, options?: WalletManagerOptions) {
    this.logger = createLogger(options?.logger, options?.logLevel, { label: 'WalletManager' });
    this.managers = {} as Record<ChainName, SingleWalletManager>;

    if (options?.metrics?.enabled) {
      const { port, path, registry } = options.metrics;
      this.exporter = new PrometheusExporter(port, path, registry);
      if (options.metrics?.serve) {
        this.logger.info('Starting metrics server.');
        this.exporter.startMetricsServer();
      }
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

      chainManager.on('error', (error) => {
        this.logger.error('Error in chain manager: ${error}');
        this.emitter.emit('error', error, chainName);
      });

      chainManager.on('balances', (balances: WalletBalance[], previousBalances: WalletBalance[]) => {
        this.logger.verbose(`Balances updated for ${chainName} (${network})`);
        this.exporter?.updateBalances(chainName, network, balances);

        this.emitter.emit('balances', chainName, network, balances, previousBalances);
      });

      chainManager.on('rebalance-started', (strategy: string, instructions: RebalanceInstruction[]) => {
        this.logger.info(`Rebalance Started. Instructions to execute: ${instructions.length}`);
        this.exporter?.updateRebalanceStarted(chainName, strategy, instructions);
      });

      chainManager.on('rebalance-finished', (strategy: string, receipts: TransferRecepit[]) => {
        this.logger.info(`Rebalance Finished. Executed transactions: ${receipts.length}}`);
        this.exporter?.updateRebalanceSuccess(chainName, strategy, receipts);
      });

      chainManager.on('rebalance-error', (error) => {
        this.logger.error(`Rebalance Error: ${error}`);
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

  public acquireLock(chainName: ChainName, opts?: WalletExecuteOptions) {
    const chainManager = this.managers[chainName];
    if (!chainManager) throw new Error(`No wallets configured for chain: ${chainName}`);

    return chainManager.acquireLock(opts);
  }

  public releaseLock(chainName: ChainName, address: string) {
    const chainManager = this.managers[chainName];
    if (!chainManager) throw new Error(`No wallets configured for chain: ${chainName}`);

    return chainManager.releaseLock(address);
  }

  public async withWallet(chainName: ChainName, fn: WithWalletExecutor, opts?: WalletExecuteOptions): Promise<void> {
    const wallet = await this.acquireLock(chainName, opts);

    try {
      return fn(wallet)
    } catch (error) {
      this.logger.error(`Error while executing wallet function: ${error}`);
      throw error;
    } finally {
      await this.releaseLock(chainName, wallet.address)
    }
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
