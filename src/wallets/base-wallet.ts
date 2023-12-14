import winston from "winston";
import { WalletBalance, TokenBalance, WalletOptions, WalletConfig } from ".";
import { createLogger } from "../utils";
import { Wallets } from "../chain-wallet-manager";

export type BaseWalletOptions = {
  logger: winston.Logger;
  failOnInvalidTokens: boolean;
};

export type TransferReceipt = {
  transactionHash: string;
  gasUsed: string;
  gasPrice: string;
  formattedCost: string;
};

export type WalletData = {
  address: string;
  privateKey?: string;
  tokens: string[];
};

export abstract class WalletToolbox {
  private warm = false;

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
  protected abstract parseTokensConfig(
    tokens: string[],
    failOnInvalidTokens: boolean,
  ): string[];

  // Should instantiate provider for the chain
  // calculate data which could be re-utilized (for example token's local addresses, symbol and decimals in evm chains)
  protected abstract warmup(): Promise<void>;

  protected abstract getAddressFromPrivateKey(
    privateKey: string,
    options?: WalletOptions,
  ): string;

  // Should return balances for a native address in the chain
  abstract pullNativeBalance(
    address: string,
    blockHeight?: number,
  ): Promise<WalletBalance>;

  // Should return balances for tokens in the list for the address specified
  abstract pullTokenBalances(
    address: string,
    tokens: string[],
  ): Promise<TokenBalance[]>;

  public abstract transferNativeBalance(
    privateKey: string,
    targetAddress: string,
    amount: number,
    maxGasPrice?: number,
    gasLimit?: number,
  ): Promise<TransferReceipt>;

  public abstract getRawWallet(privateKey: string): Promise<Wallets>;

  public abstract getGasPrice(): Promise<bigint>;

  public abstract getBlockHeight(): Promise<number>;

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
      const config = this.buildWalletConfig(raw, options);
      this.validateConfig(config, options.failOnInvalidTokens);
      wallets[config.address] = config;
    }

    this.wallets = wallets;
  }

  public async pullBalances(blockHeight?: number): Promise<WalletBalance[]> {
    if (!this.warm) {
      this.logger.debug(
        `Warming up wallet toolbox for chain ${this.chainName}...`,
      );
      try {
        await this.warmup();
      } catch (error) {
        this.logger.error(
          `Error warming up wallet toolbox for chain (${this.chainName}): ${error}`,
        );
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
        nativeBalance = await this.pullNativeBalance(address, blockHeight);

        balances.push(nativeBalance);

        this.logger.debug(
          `Balances for ${address} pulled: ${JSON.stringify(nativeBalance)}`,
        );
      } catch (error) {
        this.logger.error(
          `Error pulling native balance for ${address}: ${error}`,
        );
        continue;
      }

      if (!tokens || tokens.length === 0) {
        this.logger.verbose(`No token balances to pull for ${address}`);
        continue;
      }

      this.logger.verbose(
        `Pulling tokens (${tokens.join(", ")}) for ${address}...`,
      );

      try {
        const tokenBalances = await this.pullTokenBalances(address, tokens);

        this.logger.debug(
          `Token balances for ${address} pulled: ${JSON.stringify(
            tokenBalances,
          )}`,
        );

        nativeBalance.tokens.push(...tokenBalances);
      } catch (error) {
        this.logger.error(
          `Error pulling token balances for ${address}: ${error}`,
        );
      }
    }

    return balances;
  }

  public async pullBalancesAtBlockHeight(blockHeight: number) {
    return this.pullBalances(blockHeight);
  }

  public validateConfig(rawConfig: any, failOnInvalidTokens: boolean) {
    if (!rawConfig.address && !rawConfig.privateKey)
      throw new Error(
        `Invalid config for chain: ${this.chainName}: Missing address`,
      );

    if (failOnInvalidTokens && rawConfig.tokens?.length) {
      rawConfig.tokens.forEach((token: any) => {
        if (!this.validateTokenAddress(token)) {
          throw new Error(
            `Token not supported for ${this.chainName}[${this.network}]: ${token}`,
          );
        }
      });
    }

    return true;
  }

  public buildWalletConfig(rawConfig: any, options: WalletOptions): WalletData {
    const privateKey = rawConfig.privateKey;
    const { failOnInvalidTokens } = options;

    const address =
      rawConfig.address || this.getAddressFromPrivateKey(privateKey, options);

    const tokens = rawConfig.tokens
      ? this.parseTokensConfig(rawConfig.tokens, failOnInvalidTokens)
      : [];

    return { address, privateKey, tokens };
  }
}
