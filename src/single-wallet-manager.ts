import { EventEmitter } from 'stream';

import { getSilentLogger, Logger } from './utils';
import { createWalletToolbox, WalletConfig, WalletOptions, Wallet, WalletBalance } from './wallets';
import { WalletInterface } from './wallets/base-wallet';

const DEFAULT_POLL_INTERVAL = 60 * 1000;

export type WalletWatcherOptions = {
  logger?: Logger;
  network: string;
  chainName: string;
  rebalance: any; // TODO: type this
  balancePollInterval?: number;
  walletOptions?: WalletOptions;
}

export type WalletBalancesByAddress = Record<string, WalletBalance[]>;

export class SingleWalletManager {
  private locked = false;
  protected logger: Logger;
  protected balancesByAddress: Record<string, WalletBalance[]> = {};
  private interval: ReturnType<typeof setInterval> | null = null;
  private options: WalletWatcherOptions;
  private emitter = new EventEmitter();

  public wallet: Wallet;

  constructor(options: WalletWatcherOptions, private wallets: WalletConfig[]) {
    this.validateOptions(options);
    this.options = this.parseOptions(options);

    this.logger = options.logger || getSilentLogger();

    this.wallet = createWalletToolbox(
      options.network,
      options.chainName,
      wallets,
      { ...options.walletOptions, logger: this.logger },
    );

    if (options.rebalance) {
      // create worker that calls executeRebalanceIfNeeded at intervals
      // options.rebalance.strategy
      // options.rebalance.rebalanceInterval
      // options.rebalance.rebalanceThreshold?
    }
  }

  private validateOptions(monitorOptions: any): monitorOptions is WalletWatcherOptions {
    if (!monitorOptions.network) throw new Error('Missing network option');
    if (!monitorOptions.chainName) throw new Error('Missing chainName option');
    if (monitorOptions.pollInterval && typeof monitorOptions.pollInterval !== 'number') throw new Error('Invalid pollInterval option');
    return true;
  }

  private parseOptions(monitorOptions: WalletWatcherOptions): WalletWatcherOptions {
    return {
      ...monitorOptions,
      balancePollInterval: monitorOptions.balancePollInterval || DEFAULT_POLL_INTERVAL,
    };
  }

  private async run() {
    if (this.locked) {
      console.warn(`A monitoring run is already in progress for ${this.options.chainName}. Will skip run`);
      this.emitter.emit('skipped', { chainName: this.options.chainName, rawConfig: this.wallets });
      return;
    };

    this.locked = true;

    try {
      const balances = await this.wallet.pullBalances();
      const lastBalance = this.balancesByAddress;
      this.balancesByAddress = this.mapBalances(balances);
      this.emitter.emit('balances', balances, this.balancesByAddress, lastBalance);

    } catch (error) {
      console.error(`Error while running monitor for ${this.options.chainName}-${this.options.network} Err: ${error}`);
      this.emitter.emit('error', error);
    }

    this.locked = false;
  }

  protected mapBalances(balances: WalletBalance[]) {
    return balances.reduce((acc, balance) => {
      if (!acc[balance.address]) acc[balance.address] = [];
      acc[balance.address].push(balance);
      return acc;
    }, {} as WalletBalancesByAddress);
  };

  public on(event: string, listener: (...args: any[]) => void) {
    this.emitter.on(event, listener);
  }

  public async start() {
    this.interval = setInterval(async () => {
      this.run();
    }, DEFAULT_POLL_INTERVAL);

    this.run();
  }

  public stop() {
    if (this.interval) clearInterval(this.interval);
  }

  public getBalances(): WalletBalancesByAddress {
    return this.balancesByAddress;
  }

  public async withWallet(fn: (w: WalletInterface) => {}) {
    const wallet = await this.wallet.acquire();
    
    let result: any;
    try {
      result = await fn(wallet);
    } catch (error) {
      this.logger.error(`Error while executing wallet function: ${error}`);
      await this.wallet.release(wallet);
      throw error;
    }

    await this.wallet.release(wallet);

    return result;
  }

  // Returns a boolean indicating if a rebalance was executed
  public async executeRebalanceIfNeeded(): Promise<Boolean> {

    return false;
  }
}
