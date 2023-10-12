import winston from 'winston';
import { WalletBalance, TokenBalance, WalletOptions, WalletConfig } from ".";
import { LocalWalletPool, WalletPool } from "./wallet-pool";
import { createLogger } from '../utils';
import { Wallets } from '../chain-wallet-manager';
import { BigNumber } from 'ethers';

export type BaseWalletOptions = {
  logger: winston.Logger;
  failOnInvalidTokens: boolean;
}

export type TransferRecepit = {
  transactionHash: string,
  gasUsed: string,
  gasPrice: string,
  formattedCost: string,
}

const DEFAULT_WALLET_ACQUIRE_TIMEOUT = 5000;

export type WalletData = {
  address: string;
  privateKey?: string;
  tokens: string[];
};

export abstract class WalletToolbox {
  private warm = false;
  private walletPool: WalletPool;
  protected balancesByWalletAddress: Record<string, WalletBalance[]> = {};
  protected wallets: Record<string, WalletData>;
  protected logger: winston.Logger;

  protected abstract validateNetwork(network: string): boolean;

  protected abstract validateChainName(chainName: string): boolean;

  protected abstract validateOptions(options: any): boolean;

  protected abstract validateTokenAddress(token: string): boolean;

  // Should parse tokens received from the user.
  // The tokens returned should be a list of token addresses used by the chain client
  // Example: ["DAI", "USDC"] => ["0x00000000", "0x00000001"];
  protected abstract parseTokensConfig(tokens: string[], failOnInvalidTokens: boolean): string[];

  // Should instantiate provider for the chain
  // calculate data which could be re-utilized (for example token's local addresses, symbol and decimals in evm chains)
  protected abstract warmup(): Promise<void>;

  protected abstract getAddressFromPrivateKey(privateKey: string): string;

  // Should return balances for a native address in the chain
  abstract pullNativeBalance(address: string): Promise<WalletBalance>;

  // Should return balances for tokens in the list for the address specified
  abstract pullTokenBalances(address: string, tokens: string[]): Promise<TokenBalance[]>;

  protected abstract transferNativeBalance(privateKey: string, targetAddress: string, amount: number, maxGasPrice?: number, gasLimit?: number): Promise<TransferRecepit>;

  protected abstract getRawWallet (privateKey: string): Promise<Wallets>;

  public abstract getGasPrice (): Promise<bigint | BigNumber>;

  constructor(
    protected network: string,
    protected chainName: string,
    protected rawConfig: WalletConfig[],
    options: WalletOptions,
  ) {
    this.logger = createLogger(options.logger);

    this.validateNetwork(network);
    this.validateChainName(chainName);
    this.validateOptions(options);

    const wallets = {} as Record<string, WalletData>;
    
    for (const raw of rawConfig) {
      const config = this.buildWalletConfig(raw, options.failOnInvalidTokens);
      this.validateConfig(config, options.failOnInvalidTokens);
      wallets[config.address] = config;
    }

    this.wallets = wallets;

    this.walletPool = new LocalWalletPool(Object.keys(this.wallets)); // if HA: new DistributedWalletPool();
  }

  public async pullBalances(
    isRebalancingEnabled = false,
    minBalanceThreshold?: number,
  ): Promise<WalletBalance[]> {
    if (!this.warm) {
      this.logger.debug(`Warming up wallet toolbox for chain ${this.chainName}...`);
      try {
        await this.warmup();
      } catch (error) {
        this.logger.error(`Error warming up wallet toolbox for chain (${this.chainName}): ${error}`);
        return [];
      }
      this.warm = true;
    }

    const balances: WalletBalance[] = [];

    for (const config of Object.values(this.wallets)) {
      const { address, tokens } = config;

      this.logger.verbose(`Pulling balances for ${address}...`);

      let nativeBalance: WalletBalance;

      try {
        nativeBalance = await this.pullNativeBalance(address);

        this.addOrDiscardWalletIfRequired(
          isRebalancingEnabled,
          address,
          nativeBalance,
          minBalanceThreshold ?? 0,
        );

        balances.push(nativeBalance);

        this.logger.debug(`Balances for ${address} pulled: ${JSON.stringify(nativeBalance)}`)
      } catch (error) {
        this.logger.error(`Error pulling native balance for ${address}: ${error}`);
        continue;
      }

      if (!tokens || tokens.length === 0) {
        this.logger.verbose(`No token balances to pull for ${address}`);
        continue;
      }

      this.logger.verbose(`Pulling tokens (${tokens.join(', ')}) for ${address}...`);

      try {
        const tokenBalances = await this.pullTokenBalances(address, tokens);

        this.logger.debug(`Token balances for ${address} pulled: ${JSON.stringify(tokenBalances)}`);

        nativeBalance.tokens.push(...tokenBalances);
      } catch (error) {
        this.logger.error(`Error pulling token balances for ${address}: ${error}`);
      }
    }

    return balances;
  }

  public async acquire(address?: string, acquireTimeout?: number) {
    const timeout = acquireTimeout || DEFAULT_WALLET_ACQUIRE_TIMEOUT;
    // this.grpcClient.acquireWallet(address);
    const walletAddress = await this.walletPool.blockAndAcquire(timeout, address);

    const privateKey = this.wallets[walletAddress].privateKey;

    return {
      address: walletAddress,
      rawWallet: await this.getRawWallet(privateKey!)
    };
  }

  public async release(address: string) {
    await this.walletPool.release(address);
  }

  public async transferBalance(sourceAddress: string, targetAddress: string, amount: number, maxGasPrice?: number, gasLimit?: number) {
    const privateKey = this.wallets[sourceAddress].privateKey;

    if (!privateKey) {
      throw new Error(`Private key for ${sourceAddress} not found`);
    }

    await this.walletPool.blockAndAcquire(DEFAULT_WALLET_ACQUIRE_TIMEOUT, sourceAddress);

    let receipt;
    try {
      receipt = await this.transferNativeBalance(privateKey, targetAddress, amount, maxGasPrice, gasLimit);
    } catch (error) {
      await this.walletPool.release(sourceAddress);
      throw error;
    }

    await this.walletPool.release(sourceAddress);

    return receipt;
  }

  private validateConfig(rawConfig: any, failOnInvalidTokens: boolean) {
    if (!rawConfig.address && !rawConfig.privateKey)
      throw new Error(`Invalid config for chain: ${this.chainName}: Missing address`);

    if (failOnInvalidTokens && rawConfig.tokens?.length) {
      rawConfig.tokens.forEach((token: any) => {
        if (!this.validateTokenAddress(token)) {
          throw new Error(`Token not supported for ${this.chainName}[${this.network}]: ${token}`)
        }
      });
    }

    return true;
  }

  private buildWalletConfig(rawConfig: any, failOnInvalidTokens: boolean): WalletData {
    const privateKey = rawConfig.privateKey;

    const address = rawConfig.address || this.getAddressFromPrivateKey(privateKey);

    const tokens = rawConfig.tokens ? this.parseTokensConfig(rawConfig.tokens, failOnInvalidTokens) : [];

    return { address, privateKey, tokens };
  }

  /**
   * Removes the wallet from the pool or adds the wallet back in the
   * pool based on the min threshold specified in the rebalance config
   *
   * @param address wallet address
   * @param balance native balance in the wallet
   * @param minBalanceThreshold passed from rebalance config, defaults to zero
   * @returns true if there is enough balance on the wallet, false otherwise
   */
  private addOrDiscardWalletIfRequired(
    isRebalancingEnabled: boolean,
    address: string,
    balance: WalletBalance,
    minBalanceThreshold: number,
  ): boolean {
    const isEnoughWalletBalance =
      Number(balance.formattedBalance) >= minBalanceThreshold;

    if (isRebalancingEnabled && balance.isNative) {
      if (isEnoughWalletBalance) {
        // set's the discarded flag on the wallet to false
        this.walletPool.addWalletBackToPoolIfRequired(address);
      } else {
        // set's the discarded flag on the wallet to true
        this.walletPool.discardWalletFromPool(address);
      }
    }

    return isEnoughWalletBalance;
  }
}
