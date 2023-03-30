import { EventEmitter } from 'stream';

import { getSilentLogger, Logger } from './utils';
import { createWalletToolbox, WalletConfig, WalletOptions, Wallet } from './wallets';

const defaultCooldown = 60 * 1000;

export type WalletMonitorOptions = {
  network: string;
  chainName: string;
  cooldown?: number;
  logger?: Logger;
  walletOptions?: WalletOptions;
}

export class WalletWatcher {
  private locked = false;
  protected logger: Logger;
  private interval: ReturnType<typeof setInterval> | null = null;
  private options: WalletMonitorOptions;
  private emitter = new EventEmitter();
  
  public wallet: Wallet;

  constructor(options: WalletMonitorOptions, private wallets: WalletConfig[]) {
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

  private validateOptions(monitorOptions: any): monitorOptions is WalletMonitorOptions {
    if (!monitorOptions.network) throw new Error('Missing network option');
    if (!monitorOptions.chainName) throw new Error('Missing chainName option');
    if (monitorOptions.cooldown && typeof monitorOptions.cooldown !== 'number') throw new Error('Invalid cooldown option');
    return true;
  }

  private parseOptions(monitorOptions: WalletMonitorOptions): WalletMonitorOptions {
    return {
      ...monitorOptions,
      cooldown: monitorOptions.cooldown || defaultCooldown,
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
    }, defaultCooldown);

    this.run();
  }

  public stop() {
    if (this.interval) clearInterval(this.interval);
  }
}
