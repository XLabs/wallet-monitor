import { EventEmitter } from 'stream';

import { getSilentLogger, Logger } from './utils';
import { WalletWatcher } from "./wallet-watcher";
import { ChainName, isChain, KNOWN_CHAINS, WalletBalance } from './wallets';

export type WalletWatcherChainConfig = {
  network?: string;
  chainConfig?: any;
  addresses: Record<string, string[]>;
}

export type WalletBalancesByAddress = Record<string, WalletBalance[]>;

export type MultiWalletWatcherConfig = Record<string, WalletWatcherChainConfig>;

export type Balances = Record<ChainName, WalletBalancesByAddress>;
// {
//   [chainName in keyof ChainName]: WalletBalancesByAddress;
// }

export type MultiWalletWatcherOptions = {
  logger?: Logger;
  pollInterval?: number;
};

function getDefaultNetwork(chainName: ChainName) {
  return KNOWN_CHAINS[chainName].defaultNetwork;
}

export class MultiWalletWatcher {
  private emitter: EventEmitter = new EventEmitter();
  private watchers: WalletWatcher[];
  private balances: Balances;
  protected logger: Logger; 

  constructor(rawConfig: MultiWalletWatcherConfig, options?: MultiWalletWatcherOptions) {
    this.logger = options?.logger || getSilentLogger();
    this.balances = {} as Balances;
    this.watchers = [] as WalletWatcher[];
    
    for (const [chainName, config] of Object.entries(rawConfig)) {
      if (!isChain(chainName)) throw new Error(`Invalid chain name: ${chainName}`);
      const network = config.network || getDefaultNetwork(chainName);

      this.balances[chainName] = {};
      const wallets = [];
      
      for (const [address, tokens] of Object.entries(config.addresses)) {
        wallets.push({ address, tokens });
        this.balances[chainName][address] = [];
      };

      const watcherConfig = {
        chainName, network, logger: this.logger, pollInterval: options?.pollInterval,
      };

      const chainWatcher = new WalletWatcher(watcherConfig, wallets);

      chainWatcher.on('error', (...args: any[]) => {
        this.emitter.emit('error', chainName, ...args);
      });

      chainWatcher.on('balances', (balances: WalletBalance[]) => {
        const mappedBalances = this.mapBalances(balances);
        const lastBalance = this.balances[chainName];
        this.balances[chainName] = mappedBalances;
        this.emitter.emit('balances', chainName, network, mappedBalances, lastBalance);
      });

      this.watchers.push(chainWatcher);
    };
  }

  protected mapBalances(balances: WalletBalance[]) {
    return balances.reduce((acc, balance) => {
      if (!acc[balance.address]) acc[balance.address] = [];
      acc[balance.address].push(balance);
      return acc;
    }, {} as WalletBalancesByAddress);
  };

  public getBalances() {
    return this.balances;
  }

  public start() {
    this.watchers.forEach((monitor) => monitor.start());
  }

  public stop() {
    this.watchers.forEach((monitor) => monitor.stop());
  }

  public on(event: string, listener: (...args: any[]) => void) {
    this.emitter.on(event, listener);
  }
}
