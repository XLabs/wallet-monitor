import Koa from 'koa';
import Router from 'koa-router';
import { Counter, Gauge, Registry } from 'prom-client';

import { WalletBalance, TokenBalance } from './wallets';
import { TransferRecepit } from './wallets/base-wallet';

function updateBalancesGauge(gauge: Gauge, chainName: string, network: string, balance: WalletBalance | TokenBalance) {
  const { symbol, address, isNative } = balance;
  const tokenAddress = (balance as TokenBalance).tokenAddress || '';
  gauge
    .labels(chainName, network, symbol, isNative.toString(), tokenAddress, address)
    .set(parseFloat(balance.formattedBalance));
}

function updateBalancesInUsdGauge(gauge: Gauge, chainName: string, network: string, balance: WalletBalance | TokenBalance) {
  const { symbol, address, isNative, usd } = balance;

  if (!usd) return;

  const tokenAddress = (balance as TokenBalance).tokenAddress || '';
  gauge
    .labels(chainName, network, symbol, isNative.toString(), tokenAddress, address)
    .set(Number(usd.toString()));
}

function updateAvailableWalletsGauge(gauge: Gauge, chainName: string, network: string, count: number) {
  gauge
    .labels(chainName, network)
    .set(count);
}

function updateWalletsLockPeriodGauge(gauge: Gauge, chainName: string, network: string, walletAddress: string, lockTime: number) {
  gauge
    .labels(chainName, network, walletAddress)
    .set(lockTime);
}

function createRebalanceExpenditureCounter (registry: Registry, name: string) {
  return new Counter({
    name,
    help: "Total native token cost of the rebalances performed",
    labelNames: ["chain_name", "strategy"],
    registers: [registry],
  });
}

function createRebalanceInstructionsCounter (registry: Registry, name: string) {
  return new Counter({
    name,
    help: "Total number of instructions executed during rebalances",
    labelNames: ["chain_name", "strategy", "status"],
    registers: [registry],
  });
}

function createCounter(registry: Registry, name: string, help: string, labels: string[]) {
  return new Counter({
    name,
    help,
    labelNames: labels,
    registers: [registry],
  });
}

function createBalancesGauge(registry: Registry, gaugeName: string) {
  return new Gauge({
    name: gaugeName,
    help: "Balances pulled for each configured wallet",
    labelNames: ["chain_name", "network", "symbol", "is_native", "token_address", "wallet_address"],
    registers: [registry],
  });
}

function createBalancesInUsdGauge(registry: Registry, gaugeName: string) {
  return new Gauge({
    name: gaugeName,
    help: "Balances pulled for each configured wallet in USD",
    labelNames: ["chain_name", "network", "symbol", "is_native", "token_address", "wallet_address"],
    registers: [registry],
  });
}

function createAvailableWalletsGauge(registry: Registry, gaugeName: string) {
  return new Gauge({
    name: gaugeName,
    help: "Number of available wallets per chain",
    labelNames: ["chain_name", "network"],
    registers: [registry],
  });
}

function createWalletsLockPeriodGauge(registry: Registry, gaugeName: string) {
  return new Gauge({
    name: gaugeName,
    help: "Amount of time a wallet was locked",
    labelNames: ["chain_name", "network", "wallet_address"],
    registers: [registry],
  });
}

function startMetricsServer (
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
  public app?: Koa;

  private balancesGauge: Gauge;
  private balancesUsdGauge: Gauge;
  private availableWalletsGauge: Gauge;
  private walletsLockPeriodGauge: Gauge;
  private rebalanceExpenditureCounter: Counter;
  private rebalanceInstructionsCounter: Counter;
  private locksAcquiredCounter: Counter;


  private prometheusPort: number;
  private prometheusPath: string;
  private registry: Registry;

  constructor(port?: number, path?: string, registry?: Registry) {
    this.registry = registry || new Registry();
    this.prometheusPort = port || 9090;
    this.prometheusPath = path || '/metrics';

    this.balancesGauge = createBalancesGauge(this.registry, 'wallet_monitor_balance');
    this.balancesUsdGauge = createBalancesInUsdGauge(this.registry, 'wallet_monitor_balance_usd')
    this.availableWalletsGauge = createAvailableWalletsGauge(this.registry, 'wallet_monitor_available_wallets');
    this.walletsLockPeriodGauge = createWalletsLockPeriodGauge(this.registry, 'wallet_monitor_wallets_lock_period')
    this.rebalanceExpenditureCounter = createRebalanceExpenditureCounter(this.registry, 'wallet_monitor_rebalance_expenditure');
    this.rebalanceInstructionsCounter = createRebalanceInstructionsCounter(this.registry, 'wallet_monitor_rebalance_instruction');
    this.locksAcquiredCounter = createCounter(this.registry, "locks_acquired_total", "Total number of acquired locks", ['chain_name', 'status']);
  }

  public getRegistry() {
    return this.registry;
  }

  public metrics() {
    return this.registry.metrics();
  }

  public updateBalances(chainName: string, network: string, balances: WalletBalance[]) {
    balances.forEach(balance => {
      updateBalancesGauge(this.balancesGauge, chainName, network, balance);

      balance.tokens?.forEach((tokenBalance: TokenBalance) => {
        updateBalancesGauge(this.balancesGauge, chainName, network, tokenBalance);
        // Only added for token balances as of now
        updateBalancesInUsdGauge(this.balancesUsdGauge, chainName, network, tokenBalance)
      });
    });
  }

  public updateActiveWallets (chainName: string, network: string, count: number) {
    updateAvailableWalletsGauge(this.availableWalletsGauge, chainName, network, count);
  }

  public updateWalletsLockPeriod(chainName: string, network: string, walletAddress: string, lockTime: number) {
    updateWalletsLockPeriodGauge(this.walletsLockPeriodGauge, chainName, network, walletAddress, lockTime);
  }
  
  public updateRebalanceSuccess(chainName: string, strategy: string, receipts: TransferRecepit[]) {
    this.rebalanceInstructionsCounter.labels(chainName, strategy, "success").inc(receipts.length);
    const totalExpenditure = receipts.reduce((total, receipt) => {
      return total + parseFloat(receipt.formattedCost);
    }, 0);
    this.rebalanceExpenditureCounter.labels(chainName, strategy).inc(totalExpenditure);
  }

  public updateRebalanceFailure(chainName: string, strategy: string) {
    this.rebalanceInstructionsCounter.labels(chainName, strategy, "failed").inc();
  }

  public increaseAcquiredLocks(chainName: string) {
    this.locksAcquiredCounter.labels(chainName, "success").inc();
  }
    
  public increaseAcquireLockFailure(chainName: string) {
    this.locksAcquiredCounter.labels(chainName, "failed").inc();
  }

  public async startMetricsServer(): Promise<void> {
    this.app = await startMetricsServer(this.prometheusPort, this.prometheusPath, async () => {
      const metrics = await this.metrics()
      return metrics;
    });
  }
}