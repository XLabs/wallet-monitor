import { EventEmitter } from 'stream';
import winston from 'winston';
import { createLogger } from './utils';
import { createWalletToolbox, WalletConfig, WalletOptions, Wallet, WalletBalance } from './wallets';
import { TransferRecepit, WalletInterface } from './wallets/base-wallet';
import { rebalanceStrategies, RebalanceStrategyName } from './rebalance-strategies';

const DEFAULT_POLL_INTERVAL = 60 * 1000;
const DEFAULT_REBALANCE_INTERVAL = 60 * 1000;
const DEFAULT_REBALANCE_STRATEGY = 'pourOver';

export type WithWalletExecutor = (wallet: WalletInterface) => Promise<void>;

export type ChainWalletManagerOptions = {
  logger: winston.Logger;

  network: string;
  chainName: string;
  rebalance: {
    enabled: boolean;
    strategy: RebalanceStrategyName;
    interval: number; // ms
    minBalanceThreshold: number;
    maxGasPrice?: number;
    gasLimit?: number;
  };
  balancePollInterval?: number;
  walletOptions?: WalletOptions;
}

export type WalletBalancesByAddress = Record<string, WalletBalance>;

export type WalletExecuteOptions = {
  address?: string;
  waitToAcquireTimeout?: number,
  leaseTimeout?: number;
}

export class ChainWalletManager {
  private locked = false;
  private rebalanceLocked = false;
  protected logger: winston.Logger;
  protected balancesByAddress: WalletBalancesByAddress = {};
  private interval: ReturnType<typeof setInterval> | null = null;
  private rebalanceInterval: ReturnType<typeof setInterval> | null = null;
  private options: ChainWalletManagerOptions;
  private emitter = new EventEmitter();

  public walletToolbox: Wallet;

  constructor(options: any, private wallets: WalletConfig[]) {
    this.validateOptions(options);
    this.options = this.parseOptions(options);

    if (this.options.rebalance.enabled) {
      this.validateRebalanceConfiguration(this.options.rebalance, wallets);
    }

    this.logger = createLogger(this.options.logger);

    this.walletToolbox = createWalletToolbox(
      options.network,
      options.chainName,
      wallets,
      { ...options.walletOptions, logger: this.logger },
    );
  }

  private validateOptions(options: any): options is ChainWalletManagerOptions {
    if (!options.network) throw new Error('Missing network option');
    if (!options.chainName) throw new Error('Missing chainName option');
    if (options.balancePollInterval && typeof options.balancePollInterval !== 'number') throw new Error('Invalid pollInterval option');

    return true;
  }

  private parseOptions(options: ChainWalletManagerOptions): ChainWalletManagerOptions {
    const rebalanceOptions = {
      enabled: options.rebalance?.enabled || false,
      strategy: options.rebalance?.strategy || DEFAULT_REBALANCE_STRATEGY,
      interval: options.rebalance?.interval || DEFAULT_REBALANCE_INTERVAL,
      minBalanceThreshold: options.rebalance?.minBalanceThreshold || 0,
      maxGasPrice: options.rebalance?.maxGasPrice,
      gasLimit: options.rebalance?.gasLimit,
    };

    return {
      ...options,
      rebalance: rebalanceOptions,
      balancePollInterval: options.balancePollInterval || DEFAULT_POLL_INTERVAL,
    };
  }

  private validateRebalanceConfiguration(rebalanceConfig: any, wallets: WalletConfig[]) {
    if (!rebalanceConfig.enabled) return true;

    if (!rebalanceStrategies[rebalanceConfig.strategy])
      throw new Error(`Invalid rebalance strategy ${rebalanceConfig.strategy}`);

    if (typeof rebalanceConfig.minBalanceThreshold !== 'number')
      throw new Error('Invalid minBalanceThreshold option');

    if (typeof rebalanceConfig.interval !== 'number')
      throw new Error('Invalid rebalance interval option');

    if (rebalanceConfig.minBalanceThreshold < 0)
      throw new Error('Invalid minBalanceThreshold option');
    
    if (rebalanceConfig.interval < 0)
      throw new Error('Invalid rebalance interval option');

    if (rebalanceConfig.enabled && wallets.length < 2)
      throw new Error('Rebalance enabled but only one wallet configured');

    if (rebalanceConfig.maxGasPrice && typeof rebalanceConfig.maxGasPrice !== 'number')
      throw new Error('Invalid maxGasPrice option');

    if (rebalanceConfig.gasLimit && typeof rebalanceConfig.gasLimit !== 'number')
      throw new Error('Invalid gasLimit option');

    const walletWithNoPk = wallets.find(w => !w.privateKey);

    if (walletWithNoPk)
      throw new Error(`Rebalance enabled but wallet ${walletWithNoPk.address} has no private key`);

    return true;
  }

  private async refreshBalances() {
    if (this.locked) {
      console.warn(`A monitoring run is already in progress for ${this.options.chainName}. Will skip run`);
      this.emitter.emit('skipped', { chainName: this.options.chainName, rawConfig: this.wallets });
      return;
    };

    this.locked = true;

    try {
      const balances = await this.walletToolbox.pullBalances();
      const lastBalance = this.balancesByAddress;
      this.balancesByAddress = this.mapBalances(balances);
      this.emitter.emit('balances', balances, this.balancesByAddress, lastBalance);

    } catch (error) {
      console.error(`Error while running monitor for ${this.options.chainName}-${this.options.network} Err: ${error}`);
      this.emitter.emit('error', error);
    }

    this.logger.debug('Balances refreshed.');
    this.locked = false;
  }

  protected mapBalances(balances: WalletBalance[]) {
    return balances.reduce((acc, balance) => {
      if (!acc[balance.address]) acc[balance.address] = balance;
      else this.logger.warn(`Duplicate balance found for address ${balance.address} (${this.options.chainName})`);

      return acc;
    }, {} as WalletBalancesByAddress);
  };

  public on(event: string, listener: (...args: any[]) => void) {
    this.emitter.on(event, listener);
  }

  public async start() {
    this.logger.info(`Starting Manager for chain: ${this.options.chainName}`);
    this.interval = setInterval(async () => {
      this.refreshBalances();
    }, DEFAULT_POLL_INTERVAL);

    if (this.options.rebalance.enabled) {
      this.logger.info(`Starting Rebalancing Cycle for chain: ${this.options.chainName}. Strategy: "${this.options.rebalance.strategy}"`);
      this.rebalanceInterval = setInterval(() => {
        this.executeRebalanceIfNeeded();
      }, this.options.rebalance.interval);
    }

    this.refreshBalances();
  }

  public stop() {
    if (this.interval) clearInterval(this.interval);
    if (this.rebalanceInterval) clearInterval(this.rebalanceInterval);
  }

  public getBalances(): WalletBalancesByAddress {
    return this.balancesByAddress;
  }

  public async acquireLock(opts?: WalletExecuteOptions) {
    return this.walletToolbox.acquire(opts?.address, opts?.leaseTimeout)
  }

  public async releaseLock(address: string) {
    return this.walletToolbox.release(address)
  }

  // Returns a boolean indicating if a rebalance was executed
  public async executeRebalanceIfNeeded(): Promise<Boolean> {
    if (this.rebalanceLocked) {
      this.logger.warn(`A rebalance is already in progress for ${this.options.chainName}. Will skip rebalance`);
      return false;
    }
    
    const { rebalance: { strategy, minBalanceThreshold, maxGasPrice, gasLimit } } = this.options;

    let instructions;
    try {
      instructions = rebalanceStrategies[strategy](this.balancesByAddress, minBalanceThreshold);
    } catch (error) {
      this.logger.error(`Rebalance strategy failed for ${this.options.chainName}: ${error}`);
      return false;
    }

    this.logger.debug(`Rebalance instructions for ${this.options.chainName}: ${JSON.stringify(instructions)}`);

    if (!instructions.length) return false;

    this.rebalanceLocked = true;

    this.emitter.emit('rebalance-started', strategy, instructions);

    const receipts: TransferRecepit[] = [];

    for (const instruction of instructions) {
      const { sourceAddress, targetAddress, amount } = instruction;

      let receipt;
      try {
        receipt = await this.walletToolbox.transferBalance(sourceAddress, targetAddress, amount, maxGasPrice, gasLimit);
      } catch (error) {
        this.emitter.emit('rebalance-error', error, instruction, strategy);
        continue;
      }
      
      receipts.push(receipt);
    };
    
    await this.refreshBalances();
    
    this.rebalanceLocked = false;

    this.emitter.emit('rebalance-finished', strategy, receipts);

    return true;
  }
}
