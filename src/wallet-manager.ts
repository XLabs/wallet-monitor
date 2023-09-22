import { EventEmitter } from "stream";

import { z } from "zod";
import winston from "winston";
import { createLogger } from "./utils";
import { PrometheusExporter } from "./prometheus-exporter";
import {
  ChainWalletManager,
  WalletExecuteOptions,
  WithWalletExecutor,
  WalletBalancesByAddress,
  WalletInterface,
} from "./chain-wallet-manager";
import {
  ChainName,
  isChain,
  KNOWN_CHAINS,
  WalletBalance,
  WalletConfigSchema,
} from "./wallets";
import { TransferRecepit } from "./wallets/base-wallet";
import { RebalanceInstruction } from "./rebalance-strategies";

export const WalletRebalancingConfigSchema = z.object({
  enabled: z.boolean(),
  strategy: z.string().optional(),
  interval: z.number().optional(),
  minBalanceThreshold: z.number().optional(),
  maxGasPrice: z.number().optional(),
  gasLimit: z.number().optional(),
});

export type WalletRebalancingConfig = z.infer<
  typeof WalletRebalancingConfigSchema
>;

export const WalletManagerChainConfigSchema = z.object({
  network: z.string().optional(),
  // FIXME: This should be a zod schema
  chainConfig: z.any().optional(),
  rebalance: WalletRebalancingConfigSchema.optional(),
  wallets: z.array(WalletConfigSchema),
});

export const WalletManagerConfigSchema = z.record(
  z.string(),
  WalletManagerChainConfigSchema,
);
export type WalletManagerConfig = z.infer<typeof WalletManagerConfigSchema>;

export const WalletManagerOptionsSchema = z.object({
  logger: z.any().optional(),
  logLevel: z
    .union([
      z.literal("error"),
      z.literal("warn"),
      z.literal("info"),
      z.literal("debug"),
      z.literal("verbose"),
      z.literal("silent"),
    ])
    .optional(),
  balancePollInterval: z.number().optional(),
  metrics: z
    .object({
      enabled: z.boolean(),
      port: z.number().optional(),
      path: z.string().optional(),
      registry: z.any().optional(),
      serve: z.boolean().optional(),
    })
    .optional(),
  failOnInvalidChain: z.boolean().default(true),
  failOnInvalidTokens: z.boolean().default(true).optional(),
});

export type WalletManagerOptions = z.infer<typeof WalletManagerOptionsSchema>;

export const WalletManagerGRPCConfigSchema = z.object({
  listenAddress: z.string().default("0.0.0.0"),
  listenPort: z.number().default(50051),
  connectAddress: z.string(),
  connectPort: z.number().default(50051),
});

export const WalletManagerFullConfigSchema = z.object({
  config: WalletManagerConfigSchema,
  options: WalletManagerOptionsSchema.optional(),
  grpc: WalletManagerGRPCConfigSchema.optional(),
});
export type WalletManagerFullConfig = z.infer<
  typeof WalletManagerFullConfigSchema
>;

export function getDefaultNetwork(chainName: ChainName) {
  return KNOWN_CHAINS[chainName]!.defaultNetwork;
}

export class WalletManager {
  private emitter: EventEmitter = new EventEmitter();
  private managers: Record<ChainName, ChainWalletManager>;
  private exporter?: PrometheusExporter;

  protected logger: winston.Logger;

  constructor(config: WalletManagerConfig, options?: WalletManagerOptions) {
    this.logger = createLogger(options?.logger, options?.logLevel, {
      label: "WalletManager",
    });
    this.managers = {} as Record<ChainName, ChainWalletManager>;

    if (options?.metrics?.enabled) {
      const { port, path, registry } = options.metrics;
      this.exporter = new PrometheusExporter(port, path, registry);
      if (options.metrics?.serve) {
        this.logger.info("Starting metrics server.");
        this.exporter.startMetricsServer();
      }
    }

    for (const [chainName, chainConfig] of Object.entries(config)) {
      if (!isChain(chainName)) {
        if (options?.failOnInvalidChain) {
          throw new Error(`Invalid chain name: ${chainName}`);
        } else {
          this.logger.warn(`Invalid chain name: ${chainName}`);
          continue;
        }
      }
      const network = chainConfig.network || getDefaultNetwork(chainName);

      const chainManagerConfig = {
        network,
        chainName,
        logger: this.logger,
        rebalance: chainConfig.rebalance,
        walletOptions: chainConfig.chainConfig,
        balancePollInterval: options?.balancePollInterval,
        failOnInvalidTokens: options?.failOnInvalidTokens ?? true,
      };

      const chainManager = new ChainWalletManager(
        chainManagerConfig,
        chainConfig.wallets,
      );

      chainManager.on("error", error => {
        this.logger.error("Error in chain manager: ${error}");
        this.emitter.emit("error", error, chainName);
      });

      chainManager.on(
        "balances",
        (balances: WalletBalance[], previousBalances: WalletBalance[]) => {
          this.logger.verbose(`Balances updated for ${chainName} (${network})`);
          this.exporter?.updateBalances(chainName, network, balances);

          this.emitter.emit(
            "balances",
            chainName,
            network,
            balances,
            previousBalances,
          );
        },
      );

      chainManager.on(
        "rebalance-started",
        (strategy: string, instructions: RebalanceInstruction[]) => {
          this.logger.info(
            `Rebalance Started. Instructions to execute: ${instructions.length}`,
          );
          this.exporter?.updateRebalanceStarted(
            chainName,
            strategy,
            instructions,
          );
        },
      );

      chainManager.on(
        "rebalance-finished",
        (strategy: string, receipts: TransferRecepit[]) => {
          this.logger.info(
            `Rebalance Finished. Executed transactions: ${receipts.length}}`,
          );
          this.exporter?.updateRebalanceSuccess(chainName, strategy, receipts);
        },
      );

      chainManager.on("rebalance-error", (error, _, strategy) => {
        this.logger.error(`Rebalance Error: ${error}`);
        this.exporter?.updateRebalanceFailure(chainName, strategy);
      });

      chainManager.on("active-wallets-count", (chainName, network, count) => {
        this.exporter?.updateActiveWallets(chainName, network, count);
      })

      chainManager.on("wallets-lock-period", (chainName, network, walletAddress, lockTime) => {
        this.exporter?.updateWalletsLockPeriod(chainName, network, walletAddress, lockTime);
      })

      this.managers[chainName] = chainManager;

      chainManager.start();
    }
  }

  public stop() {
    Object.values(this.managers).forEach(manager => manager.stop());
  }

  public on(event: string, listener: (...args: any[]) => void) {
    this.emitter.on(event, listener);
  }

  public metrics() {
    return this.exporter?.metrics();
  }

  public getRegistry() {
    return this.exporter?.getRegistry();
  }

  public async acquireLock(
    chainName: ChainName,
    opts?: WalletExecuteOptions,
  ): Promise<WalletInterface> {
    const chainManager = this.managers[chainName];
    if (!chainManager)
      throw new Error(`No wallets configured for chain: ${chainName}`);

    let wallet: WalletInterface;
    try {
      wallet = await chainManager.acquireLock(opts);
      this.exporter?.increaseAcquiredLocks(chainName);
    } catch (error) {
      this.exporter?.increaseAcquireLockFailure(chainName);
      throw error;
    }
    return wallet;
  }

  public releaseLock(chainName: ChainName, address: string) {
    const chainManager = this.managers[chainName];
    if (!chainManager)
      throw new Error(`No wallets configured for chain: ${chainName}`);

    return chainManager.releaseLock(address);
  }

  /**
   * Guarantees wallet will only be used by caller in a single process setup.
   * There is no enforcement of lease timeout, so you should have one defined by the fn param.
   * If no lock is obtained befored specified waitToAcquireTimeout expires, an error will be thrown.
   *
   * @param chainName
   * @param fn
   * @param opts - leaseTimeout will be ignored
   */
  public async withWallet(
    chainName: ChainName,
    fn: WithWalletExecutor,
    opts?: WalletExecuteOptions,
  ): Promise<void> {
    const wallet = await this.acquireLock(chainName, opts);

    try {
      await fn(wallet);
    } finally {
      await this.releaseLock(chainName, wallet.address);
    }
  }

  public getAllBalances(): Record<string, WalletBalancesByAddress> {
    const balances: Record<string, WalletBalancesByAddress> = {};

    for (const [chainName, manager] of Object.entries(this.managers)) {
      balances[chainName] = manager.getBalances();
    }

    return balances;
  }

  public getChainBalances(chainName: ChainName): WalletBalancesByAddress {
    const manager = this.managers[chainName];
    if (!manager)
      throw new Error(`No wallets configured for chain: ${chainName}`);

    return manager.getBalances();
  }
}
