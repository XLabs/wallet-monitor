import { EventEmitter } from 'stream';

import { getSilentLogger, Logger } from './utils';
import { createWalletToolbox, WalletConfig, WalletOptions, Wallet } from './wallets';

const DEFAULT_POLL_INTERVAL = 60 * 1000;

export type WalletWatcherOptions = {
  network: string;
  chainName: string;
  pollInterval?: number;
  logger?: Logger;
  walletOptions?: WalletOptions;
}

export class WalletWatcher {
  private locked = false;
  protected logger: Logger;
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
      pollInterval: monitorOptions.pollInterval || DEFAULT_POLL_INTERVAL,
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
      this.emitter.emit('balances', balances);

    } catch (error) {
      console.error(`Error while running monitor for ${this.options.chainName}-${this.options.network} Err: ${error}`);
      this.emitter.emit('error', error);
    }

    this.locked = false;
  }

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
}
