import Koa from 'koa';
import Router from 'koa-router';
import { Counter, Gauge, Registry } from 'prom-client';

import { WalletBalance, TokenBalance } from './wallets';
import { RebalanceInstruction } from './rebalance-strategies';
import { TransferRecepit } from './wallets/base-wallet';

export function updateBalancesGauge(gauge: Gauge, chainName: string, network: string, balance: WalletBalance | TokenBalance) {
  const { symbol, address, isNative } = balance;
  const tokenAddress = (balance as TokenBalance).tokenAddress || '';
  gauge
    .labels(chainName, network, symbol, isNative.toString(), tokenAddress, address)
    .set(parseFloat(balance.formattedBalance));
}

function createRebalanceCounter (registry: Registry, name: string) {
  return new Counter({
    name,
    help: "Total times a rebalance had at least one instruction to execute",
    labelNames: ["chain_name", "strategy"],
    registers: [registry],
  });
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
    labelNames: ['chain_name', 'strategy'],
    registers: [registry],
  });
}

function createRebalanceTransactionsCounter (registry: Registry, name: string) {
  return new Counter({
    name,
    help: "Total number of transactions executed during rebalances",
    labelNames: ['chain_name', 'strategy'],
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

export function createBalancesGauge(registry: Registry, gaugeName: string) {
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
  public app?: Koa;

  private balancesGauge: Gauge;
  private rebalanceCounter: Counter;
  private rebalanceExpenditureCounter: Counter;
  private rebalanceInstructionsCounter: Counter;
  private rebalanceTransactionsCounter: Counter;
  private locksAcquiredCounter: Counter;


  private prometheusPort: number;
  private prometheusPath: string;
  private registry: Registry;

  constructor(port?: number, path?: string, registry?: Registry) {
    this.registry = registry || new Registry();
    this.prometheusPort = port || 9090;
    this.prometheusPath = path || '/metrics';

    this.balancesGauge = createBalancesGauge(this.registry, 'wallet_monitor_balance');
    this.rebalanceCounter = createRebalanceCounter(this.registry, 'wallet_monitor_rebalance');
    this.rebalanceExpenditureCounter = createRebalanceExpenditureCounter(this.registry, 'wallet_monitor_rebalance_expenditure');
    this.rebalanceInstructionsCounter = createRebalanceInstructionsCounter(this.registry, 'wallet_monitor_rebalance_instruction');
    this.rebalanceTransactionsCounter = createRebalanceTransactionsCounter(this.registry, 'wallet_monitor_rebalance_transaction');
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
      });
    });
  }

  public updateRebalanceStarted(chainName: string, strategy: string, instructions: RebalanceInstruction[]) {
    this.rebalanceCounter.inc({ chain_name: chainName, strategy });
    this.rebalanceInstructionsCounter.inc({ chain_name: chainName, strategy }, instructions.length);
  }
  
  public updateRebalanceSuccess(chainName: string, strategy: string, receipts: TransferRecepit[]) {
    this.rebalanceTransactionsCounter.labels(chainName, strategy).inc(receipts.length);
    const totalExpenditure = receipts.reduce((total, receipt) => {
      return total + parseFloat(receipt.formattedCost);
    }, 0);
    this.rebalanceExpenditureCounter.labels(chainName, strategy).inc(totalExpenditure);
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