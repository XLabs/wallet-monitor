import { createWalletToolbox, WalletToolbox, WalletConfig } from './wallets';



const defaultCooldown = 60 * 1000; // interval to wait between scraping the balances

export class WalletMonitor {
  private locked = false;
  private interval: NodeJs.Timeout | null = null;
  private wallet: WalletToolbox;

  constructor(network: string, public chainName: string, private wallets: WalletConfig[], private cooldown: number) {
    if (!cooldown) this.cooldown = defaultCooldown;

    this.wallet = createWalletToolbox(network, chainName, wallets);
  }

  public async run() {
    if (this.locked) {
      console.warn(`A monitoring run is already in progress for ${this.chainName}. Will skip run`);
      return;
    };

    this.locked = true;

    try {
      await this.wallet.pullBalances();
    } catch (error) {
      console.error(`Error while running monitor for ${this.chainName}. Err: ${error}`);
    }
    
    this.locked = false;
  }

  public async start() {
    this.interval = setInterval(async () => {
      this.run();
    }, this.cooldown);

    this.run();
  }

  public stop() {
    if (this.interval) clearInterval(this.interval);
  }
}

export type ChainMonitoringArgs = {
  chainName: string;
  config: WalletConfig;
  cooldown: number;
}[];

export class MultiWalletMonitor {
  private monitors: WalletMonitor[] = [];

  constructor(configs: ChainMonitoringArgs) {
    this.monitors = configs.map(({ chainName, config, cooldown }) => new WalletMonitor(chainName, config, cooldown));
  }

  public async start() {
    this.monitors.forEach(monitor => monitor.start());
  }

  public stop() {
    this.monitors.forEach(monitor => monitor.stop());
  }
}