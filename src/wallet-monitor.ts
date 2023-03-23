import { EventEmitter } from 'stream';
import { createWalletToolbox } from './wallets';
import { WalletToolbox, WalletConfig, WalletOptions } from './wallets/base-wallet';

const defaultCooldown = 60 * 1000;

export type WalletMonitorOptions = {
  network: string,
  chainName: string,
  cooldown: number,
  walletOptions?: WalletOptions,
}
export class WalletMonitor {
  private locked = false;
  private interval: ReturnType<typeof setInterval> | null = null;
  private options: WalletMonitorOptions;
  private wallet: WalletToolbox;
  private emitter = new EventEmitter();

  constructor(options: WalletMonitorOptions, private wallets: WalletConfig[]) {
    this.validateOptions(options);
    this.options = this.parseOptions(options);
    this.wallet = createWalletToolbox(options.network, options.chainName, wallets, options.walletOptions);
  }

  private parseOptions(monitorOptions: WalletMonitorOptions): WalletMonitorOptions {
    return {
      ...monitorOptions,
      cooldown: monitorOptions.cooldown || defaultCooldown,
    };
  }

  private validateOptions(monitorOptions: any): monitorOptions is WalletMonitorOptions {
    if (!monitorOptions.network) throw new Error('Missing network option');
    if (!monitorOptions.chainName) throw new Error('Missing chainName option');
    return true;
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
      console.error(`Error while running monitor for ${this.options.chainName}. Err: ${error}`);
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
