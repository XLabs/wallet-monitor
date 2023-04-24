import Koa from 'koa';
import Router from 'koa-router';
import { Gauge, Registry } from 'prom-client';

import { WalletBalance, TokenBalance } from './wallets';

export function updateExporterGauge(gauge: Gauge, chainName: string, network: string, balance: WalletBalance | TokenBalance) {
  const { symbol, address, isNative } = balance;
  const tokenAddress = (balance as TokenBalance).tokenAddress || '';
  gauge
    .labels(chainName, network, symbol, isNative.toString(), tokenAddress, address)
    .set(parseFloat(balance.formattedBalance));
}

export function createExporterGauge(registry: Registry, gaugeName: string) {
  return new Gauge({
    name: gaugeName,
    help: "Balances pulled for each configured wallet",
    labelNames: ["chain_name", "network", "symbol", "is_native", "token_address", "wallet_address"],
    registers: [registry],
  });
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


export class PrometheusExporter {
  private balancesGauge: Gauge;
  private app?: Koa;
  private prometheusPort: number;
  private prometheusPath: string;
  private registry: Registry;

  constructor(port?: number, path?: string, registry?: Registry) {
    this.registry = registry || new Registry();
    this.prometheusPort = port || 9090;
    this.prometheusPath = path || '/metrics';

    this.balancesGauge = createExporterGauge(this.registry, 'wallet_monitor_balance');
  }

  public getRegistry() {
    return this.registry;
  }

  public metrics() {
    return this.registry.metrics();
  }

  public updateBalances(chainName: string, network: string, balances: WalletBalance[]) {
    balances.forEach(balance => {
      updateExporterGauge(this.balancesGauge, chainName, network, balance);

      balance.tokens?.forEach((tokenBalance: TokenBalance) => {
        updateExporterGauge(this.balancesGauge, chainName, network, tokenBalance);
      });
    });
  }

  public async startMetricsServer(): Promise<void> {
    this.app = await startMetricsServer(this.prometheusPort, this.prometheusPath, async () => {
      const metrics = await this.metrics()
      // this.logger.debug('Prometheus metrics served: OK');
      return metrics;
    });

    // this.logger.info(`Wallet Monitor Prometheus server listening on :${this.prometheusPort}${this.prometheusPath}`);
  }
}