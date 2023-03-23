import { WalletConfig } from './wallets';
import { WalletMonitor, WalletMonitorOptions } from './wallet-monitor';

export type PrometheusOptions = {};

export class PrometheusWalletMonitor extends WalletMonitor {
  constructor(options: WalletMonitorOptions, wallets: WalletConfig[], private promOpts: PrometheusOptions) {
    super(options, wallets);
    this.on('balances', (balances) => {
      // updateWalletBalances(balances) (todo, port over this part from the existing code);
    });
  }

  public getMetricsToServce() {
    // attach metrics to the given server on the given path
  }

  public startMetricsServcer(port: number = 3001, path: string = '/metrics') {
    // start koa server on port and serve metrics on path
    
  }
}
