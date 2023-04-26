export interface WalletPool {
  acquire(resourceId?: string): Promise<string>;
  blockAndAquire(blockTimeout: number, resourceId?: string): Promise<string>;
  release(wallet: string): Promise<void>;
}

import winston from 'winston';
import { WalletBalance, TokenBalance, WalletOptions, WalletConfig } from ".";
import { LocalWalletPool } from "./wallet-pool";
import { createLogger } from '../utils';

export type BaseWalletOptions = {
  logger: winston.Logger;
}

export type WalletInterface = {
  address: string;
  privateKey?: string;
  provider: any; // TODO use providers union type
}

export type TransferRecepit = {
  transactionHash: string,
  gasUsed: string,
  gasPrice: string,
  formattedCost: string,
}

const DEFAULT_WALLET_ACQUIRE_TIMEOUT = 5000;

type WalletsMap = Record<string, WalletConfig>;

export abstract class WalletToolbox {
  protected provider: any;// TODO: reevaluate the best way to do this
  private warm = false;
  private walletPool: WalletPool;
  protected balancesByWalletAddress: Record<string, WalletBalance[]> = {};
  protected wallets: WalletsMap;
  protected logger: winston.Logger;

  abstract validateNetwork(network: string): boolean;

  abstract validateChainName(chainName: string): boolean;

  abstract validateOptions(options: any): boolean;

  // throw an error if the config is invalid
  abstract validateConfig(rawConfig: any): boolean;

  // Should parse tokens received from the user.
  // The tokens returned should be a list of token addresses used by the chain client
  // Example: ["DAI", "USDC"] => ["0x00000000", "0x00000001"];
  abstract parseTokensConfig(tokens: string[]): string[];

  // Should instantiate provider for the chain
  // calculate data which could be re-utilized (for example token's local addresses, symbol and decimals in evm chains)
  abstract warmup(): Promise<void>;

  // Should return balances for a native address in the chain
  abstract pullNativeBalance(address: string): Promise<WalletBalance>;

  // Should return balances for tokens in the list for the address specified
  abstract pullTokenBalances(address: string, tokens: string[]): Promise<TokenBalance[]>;

  abstract transferNativeBalance(privateKey: string, targetAddress: string, amount: number, maxGasPrice?: number, gasLimit?: number): Promise<TransferRecepit>;

  constructor(
    protected network: string,
    protected chainName: string,
    protected rawConfig: WalletConfig[],
    options: WalletOptions,
  ) {
    this.logger = createLogger(options.logger, undefined);

    this.validateNetwork(network);
    this.validateChainName(chainName);
    this.validateOptions(options);

    this.wallets = rawConfig.reduce((acc, c) => {
      this.validateConfig(c);

      return Object.assign(acc, {
        [c.address]: {
          address: c.address,
          privateKey: c.privateKey,
          tokens: this.parseTokensConfig(c.tokens || []),
        }
      });
    }, {});

    this.walletPool = new LocalWalletPool(Object.keys(this.wallets)); // if HA: new DistributedWalletPool();
  }

  public async pullBalances(): Promise<WalletBalance[]> {
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

      let nativeBalance;

      try {
        nativeBalance = await this.pullNativeBalance(address);
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

  public async acquire(address?: string, blockTimeout?: number): Promise<WalletInterface> {
    const timeout = blockTimeout || DEFAULT_WALLET_ACQUIRE_TIMEOUT;
    const walletAddress = await this.walletPool.blockAndAquire(timeout, address);

    const privateKey = this.wallets[walletAddress].privateKey;

    return {
      privateKey,
      address: walletAddress,
      provider: this.provider,
    }
  }

  public async release(wallet: WalletInterface) {
    await this.walletPool.release(wallet.address);
  }

  public async transferBalance(sourceAddress: string, targetAddress: string, amount: number, maxGasPrice?: number, gasLimit?: number) {
    const privateKey = this.wallets[sourceAddress].privateKey;

    if (!privateKey) {
      throw new Error(`Private key for ${sourceAddress} not found`);
    }

    await this.walletPool.blockAndAquire(DEFAULT_WALLET_ACQUIRE_TIMEOUT, sourceAddress);

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
}
