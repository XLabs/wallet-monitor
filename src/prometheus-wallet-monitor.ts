import Koa from 'koa';
import Router from 'koa-router';

import { Gauge, register } from 'prom-client';

import { WalletConfig, WalletBalance } from './wallets';
import { WalletMonitor, WalletMonitorOptions } from './wallet-monitor';

export type PrometheusOptions = {
  gaugeName?: string,
};

export class PrometheusWalletMonitor extends WalletMonitor {
  private gauge: Gauge;
  public app?: Koa;
  constructor(options: WalletMonitorOptions, wallets: WalletConfig[], promOpts: PrometheusOptions = {}) {
    super(options, wallets);

    this.validatePrometheusOptions(promOpts);

    const gaugeName = promOpts.gaugeName || 'wallet_monitor_balances';
    this.gauge = new Gauge({
      name: gaugeName,
      help: "Balances pulled for each configured wallet",
      labelNames: ["chain_name", "network", "symbol", "is_native", "token_address", "wallet_address"],
    });

    this.on('balances', (balances) => {
      this.updateWalletBalances(this.wallet.chainName, this.wallet.network, balances);
    });
  }

  private validatePrometheusOptions(options: any): options is PrometheusOptions {
    if (!options) return true;
    if (typeof options !== 'object') throw new Error(`Invalid prometheus options`);
    if (options.gaugeName && typeof options.gaugeName !== 'string')
      throw new Error(`Invalid prometheus options: gaugeName must be a string`);
    return true;
  };

  private updateWalletBalances(chainName: string, network: string, balances: WalletBalance[]) {
    balances.forEach((balance) => {
      const { symbol, isNative, tokenAddress, address } = balance;
      this.gauge
        .labels(chainName, network, symbol, isNative.toString(), tokenAddress || '', address)
        .set(parseFloat(balance.formattedBalance));
    });
  }

  public getMetricsToServe() {
    return register.metrics();
  }

  public startMetricsServer(port: number = 3001, path: string = '/metrics'): Promise<void> {
    const app = new Koa();
    const router = new Router();

    router.get(path, async (ctx: Koa.Context) => {
      this.logger.debug('Serving Prometheus metrics: OK');
      ctx.body = await this.getMetricsToServe();
      this.logger.debug('Prometheus metrics served: OK');
    });

    app.use(router.routes());
    app.use(router.allowedMethods());

    this.app = app;

    return new Promise(resolve => {
      this.logger.info(`Wallet Monitor Prometheus server listening on :${port}${path}`);
      app.listen(port, () => {
        this.start();
        resolve();
      })
    });
  }
}
