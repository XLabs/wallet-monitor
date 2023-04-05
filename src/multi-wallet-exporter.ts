import Koa from 'koa';
import {Counter, Gauge, Registry} from 'prom-client';

import { ChainName, AllNetworks, WalletBalance } from './wallets';
import { MultiWalletWatcher, MultiWalletWatcherConfig, MultiWalletWatcherOptions, WalletBalancesByAddress } from './multi-wallet-watcher';
import {
  PrometheusOptions,
  createExporterGauge,
  startMetricsServer,
  createExporterErrorCounter, createExporterLastRefresh
} from './wallet-exporter';

export type MultiWalletExporterOptions = MultiWalletWatcherOptions & {
  prometheus?: PrometheusOptions;
}
export class MultiWalletExporter extends MultiWalletWatcher {
  private gauge: Gauge;
  private errorCounters: Map<string, Counter> = new Map();
  private lastRefreshTimestamp: Gauge;
  private registry: Registry;
  private app?: Koa;
  private prometheusPort: number;
  private prometheusPath: string;

  constructor(rawConfig: MultiWalletWatcherConfig, options?: MultiWalletExporterOptions) {
    super(rawConfig, options);

    this.validatePrometheusOptions(options?.prometheus);
    
    this.registry = options?.prometheus?.registry || new Registry();

    this.prometheusPort = options?.prometheus?.port || 9090;
    this.prometheusPath = options?.prometheus?.path || '/metrics';

    this.gauge = createExporterGauge(
      this.registry,
      options?.prometheus?.gaugeName || 'wallet_monitor_balance'
    );

    this.lastRefreshTimestamp = createExporterLastRefresh(this.registry, options?.prometheus?.lastUpdateName || 'last_update');

    this.on('balances', (
      chainName: ChainName,
      network: AllNetworks,
      balancesByAddress: WalletBalancesByAddress,
    ) => {
      this.updateLastRefreshMetrics(chainName);
      Object.values(balancesByAddress).forEach((balances) => {
        this.updateBalanceMetrics(chainName, network, balances);
      });
    });

    this.on('error', (chainName: string, ...args: any[]) => {
      if(!(chainName in this.errorCounters))
        this.errorCounters.set(
          chainName,
          createExporterErrorCounter(this.registry, `${chainName}_${options?.prometheus?.errorsName || `errors`}`)
        )
      const counter = this.errorCounters.get(chainName)!
      counter.inc();
    });
  }

  private updateBalanceMetrics(chainName: string, network: string, balances: WalletBalance[]) {
    balances.forEach((balance) => {
      const { symbol, isNative, tokenAddress, address } = balance;
      this.gauge
        .labels(chainName, network, symbol, isNative.toString(), tokenAddress || '', address)
        .set(parseFloat(balance.formattedBalance));
    });
  }

  private updateLastRefreshMetrics(chainName: string) {
    this.lastRefreshTimestamp
      .labels(chainName)
      .set(Date.now())
  }

  private validatePrometheusOptions(options: any): options is PrometheusOptions {
    if (!options) return true;
    if (typeof options !== 'object') throw new Error(`Invalid prometheus options`);
    if (options.gaugeName && typeof options.gaugeName !== 'string')
      throw new Error(`Invalid prometheus options: gaugeName must be a string`);
    return true;
  };

  public getRegistry() {
    return this.registry;
  }

  public metrics() {
    return this.registry.metrics();
  }

  public async startMetricsServer(): Promise<void> {
    this.app = await startMetricsServer(this.prometheusPort, this.prometheusPath, async () => {
      const metrics = await this.metrics()
      this.logger.debug('Prometheus metrics served: OK');
      return metrics;
    });

    this.logger.info(`Wallet Monitor Prometheus server listening on :${this.prometheusPort}${this.prometheusPath}`);
    
    this.start();
  }
}
