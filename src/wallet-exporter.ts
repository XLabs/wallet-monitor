import Koa from 'koa';
import Router from 'koa-router';

import {Counter, Gauge, Registry} from 'prom-client';

import { WalletConfig, WalletBalance } from './wallets';
import { WalletWatcher, WalletMonitorOptions } from './wallet-watcher';

export type PrometheusOptions = {
  registry?: Registry;
  gaugeName?: string,
  errorsName?: string
};

export function updateExporterGauge(gauge: Gauge, chainName: string, network: string, balance: WalletBalance) {
  const { symbol, isNative, tokenAddress, address } = balance;
  gauge
    .labels(chainName, network, symbol, isNative.toString(), tokenAddress || '', address)
    .set(parseFloat(balance.formattedBalance));
}

export function createExporterGauge (registry: Registry, gaugeName: string) {
  return new Gauge({
    name: gaugeName,
    help: "Balances pulled for each configured wallet",
    labelNames: ["chain_name", "network", "symbol", "is_native", "token_address", "wallet_address"],
    registers: [registry],
  });
}

export function createExporterErrorCounter(registry: Registry, counterName: string) {
  return new Counter({
    name: counterName,
    help: "Errors thrown by wallet watcher",
    registers: [registry]
  })
}

export function startMetricsServer (
  port: number, path: string, getMetrics: () => Promise<string>
): Promise<Koa> {
  const app = new Koa();
  const router = new Router();

  router.get(path, async (ctx: Koa.Context) => {
    ctx.body = await getMetrics();
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  return new Promise(resolve => {
    app.listen(port, () => {
      resolve(app);
    })
  });
}

export class WalletExporter extends WalletWatcher {
  private gauge: Gauge;
  public app?: Koa;
  protected registry: Registry;

  constructor(options: WalletMonitorOptions, wallets: WalletConfig[], promOpts: PrometheusOptions = {}) {
    super(options, wallets);

    this.validatePrometheusOptions(promOpts);
    this.registry = promOpts.registry || new Registry();

    this.gauge = createExporterGauge(
      this.registry,
      promOpts.gaugeName || 'wallet_monitor_balance'
    );

    this.on('balances', (balances) => {
      balances.forEach((balance: WalletBalance) => {
        updateExporterGauge(this.gauge, this.wallet.chainName, this.wallet.network, balance);
      });
    });
  }

  private validatePrometheusOptions(options: any): options is PrometheusOptions {
    if (!options) return true;
    if (typeof options !== 'object') throw new Error(`Invalid prometheus options`);
    if (options.gaugeName && typeof options.gaugeName !== 'string')
      throw new Error(`Invalid prometheus options: gaugeName must be a string`);
    return true;
  };

  public metrics() {
    return this.registry.metrics();
  }

  public async startMetricsServer(port: number = 3001, path: string = '/metrics'): Promise<void> {
    this.app = await startMetricsServer(port, path, async () => {
      const metrics = await this.metrics()
      this.logger.debug('Prometheus metrics served: OK');
      return metrics;
    });

    this.logger.info(`Wallet Monitor Prometheus server listening on :${port}${path}`);
    
    this.start();
  }

  public getRegistry() {
    return this.registry;
  }
}
