import { EventEmitter } from 'stream';

import { getSilentLogger, Logger, mapConcurrent } from './utils';
import { createWalletToolbox, WalletConfig, WalletOptions, Wallet, WalletBalance } from './wallets';
import { WalletInterface } from './wallets/base-wallet';
import { RebalanceInstruction, rebalanceStrategies, RebalanceStrategyName } from './rebalance-strategies';

const DEFAULT_POLL_INTERVAL = 60 * 1000;

export type WithWalletExecutor = (wallet: WalletInterface) => Promise<void>;

export type SingleWalletManagerOptions = {
  logger?: Logger;
  network: string;
  chainName: string;
  rebalance: {
    enabled: boolean;
    strategy: RebalanceStrategyName;
    interval: number; // ms
  };
  balancePollInterval?: number;
  walletOptions?: WalletOptions;
}

export type WalletBalancesByAddress = Record<string, WalletBalance[]>;

export type WalletExecuteOptions = {
  address?: string;
  blockTimeout?: number;
}

export class SingleWalletManager {
  private locked = false;
  private rebalanceLocked = false;
  protected logger: Logger;
  protected balancesByAddress: Record<string, WalletBalance[]> = {};
  private interval: ReturnType<typeof setInterval> | null = null;
  private rebalanceInterval: ReturnType<typeof setInterval> | null = null;
  private options: SingleWalletManagerOptions;
  private emitter = new EventEmitter();

  public wallet: Wallet;

  constructor(options: any, private wallets: WalletConfig[]) {
    this.validateOptions(options);
    this.options = this.parseOptions(options);

    this.logger = options.logger || getSilentLogger();

    this.wallet = createWalletToolbox(
      options.network,
      options.chainName,
      wallets,
      { ...options.walletOptions, logger: this.logger },
    );
  }

  private validateOptions(options: any): options is SingleWalletManagerOptions {
    if (!options.network) throw new Error('Missing network option');
    if (!options.chainName) throw new Error('Missing chainName option');
    if (options.balancePollInterval && typeof options.balancePollInterval !== 'number') throw new Error('Invalid pollInterval option');
    return true;
  }

  private parseOptions(options: SingleWalletManagerOptions): SingleWalletManagerOptions {
    const rebalanceOptions = {
      enabled: options?.rebalance?.enabled || false,
      strategy: options?.rebalance?.strategy || 'default',
      interval: options?.rebalance?.interval || 60 * 1000,
    };

    return {
      ...options,
      rebalance: rebalanceOptions,
      balancePollInterval: options.balancePollInterval || DEFAULT_POLL_INTERVAL,
    };
  }

  private async run() {
    if (this.locked) {
      console.warn(`A monitoring run is already in progress for ${this.options.chainName}. Will skip run`);
      this.emitter.emit('skipped', { chainName: this.options.chainName, rawConfig: this.wallets });
      return;
    };

    this.locked = true;

    try {
      const balances = await this.wallet.pullBalances();
      const lastBalance = this.balancesByAddress;
      this.balancesByAddress = this.mapBalances(balances);
      this.emitter.emit('balances', balances, this.balancesByAddress, lastBalance);

    } catch (error) {
      console.error(`Error while running monitor for ${this.options.chainName}-${this.options.network} Err: ${error}`);
      this.emitter.emit('error', error);
    }

    this.locked = false;
  }

  protected mapBalances(balances: WalletBalance[]) {
    return balances.reduce((acc, balance) => {
      if (!acc[balance.address]) acc[balance.address] = [];
      acc[balance.address].push(balance);
      return acc;
    }, {} as WalletBalancesByAddress);
  };

  public on(event: string, listener: (...args: any[]) => void) {
    this.emitter.on(event, listener);
  }

  public async start() {
    this.interval = setInterval(async () => {
      this.run();
    }, DEFAULT_POLL_INTERVAL);

    if (this.options?.rebalance?.enabled) {
      this.rebalanceInterval = setInterval(() => {
        this.executeRebalanceIfNeeded();
      });
    }

    this.run();
  }

  public stop() {
    if (this.interval) clearInterval(this.interval);
    if (this.rebalanceInterval) clearInterval(this.rebalanceInterval);
  }

  public getBalances(): WalletBalancesByAddress {
    return this.balancesByAddress;
  }

  public async withWallet(fn: (w: WalletInterface) => {}, opts?: WalletExecuteOptions) {
    const wallet = await this.wallet.acquire(opts?.address, opts?.blockTimeout);

    let result: any;
    try {
      result = await fn(wallet);
    } catch (error) {
      this.logger.error(`Error while executing wallet function: ${error}`);
      await this.wallet.release(wallet);
      throw error;
    }

    await this.wallet.release(wallet);

    return result;
  }

  // Returns a boolean indicating if a rebalance was executed
  public async executeRebalanceIfNeeded(): Promise<Boolean> {
    if (this.rebalanceLocked) {
      this.logger.warn(`A rebalance is already in progress for ${this.options.chainName}. Will skip rebalance`);
      return false;
    }

    const rebalanceStrategy = rebalanceStrategies[this.options.rebalance.strategy];
    const { shouldRebalance, instructions } = rebalanceStrategy(this.balancesByAddress);
    
    if (shouldRebalance) {
      this.rebalanceLocked = true;
      await mapConcurrent(instructions, async (instruction: RebalanceInstruction) => {
        const { sourceAddress, targetAddress, amount } = instruction;
  
        try {
          await this.wallet.transferBalance(sourceAddress, targetAddress, amount);
        } catch (error) {
          this.logger.error(`Rebalance Instruction Failed: ${JSON.stringify(instruction)}. Error: ${error}`);
        }
      }, 1);

      this.rebalanceLocked = false;
    }

    return shouldRebalance;
  }
}
