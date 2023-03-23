import { EventEmitter } from 'stream';
import { createWalletToolbox, WalletToolbox, WalletConfig, WalletOptions } from './wallets';

const defaultCooldown = 60 * 1000;

export type WalletMonitorOptions = {
  network: string,
  chainName: string,
  cooldown: number,
  walletOptions?: WalletOptions,
}

export class WalletMonitor extends EventEmitter {
  private locked = false;
  private interval: ReturnType<typeof setInterval> | null = null;
  private options: WalletMonitorOptions;
  private wallet: WalletToolbox;

  constructor(options: WalletMonitorOptions, private wallets: WalletConfig[]) {
    super();
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
      this.emit('skipped', { chainName: this.options.chainName, rawConfig: this.wallets });
      return;
    };

    this.locked = true;

    try {
      const balances = await this.wallet.pullBalances();
      this.emit('balances', balances);

    } catch (error) {
      console.error(`Error while running monitor for ${this.options.chainName}. Err: ${error}`);
      this.emit('error', error);
    }

    this.locked = false;
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
