import { WalletBalance, WalletOptions, WalletConfig } from ".";

import { getSilentLogger, Logger } from '../utils';

export type BaseWalletOptions = {
  logger?: Logger;
}

function isFunction(fn: any) {
  return fn && typeof fn === 'function';
}

function isValidLogger(logger: any): logger is Logger {
  return logger &&
    isFunction(logger.debug) &&
    isFunction(logger.info) &&
    isFunction(logger.warn) &&
    isFunction(logger.error);
}

export abstract class WalletToolbox {
  private warm = false;
  protected configs: WalletConfig[];
  protected logger: Logger;
  
  abstract validateNetwork(network: string): boolean;

  abstract validateChainName(chainName: string): boolean;

  abstract validateOptions(options: any): boolean;

  // throw an error if the config is invalid
  abstract validateConfig(rawConfig: any): boolean;

  // Should parse tokens received from the user.
  // The tokens returned should be a list of token addresses used by the chain client
  // Example: ["ETH", "USDC"] => ["0x00000000", "0x00000001"];
  abstract parseTokensConfig(tokens: string[]): string[];

  // Should instantiate provider for the chain
  // calculate data which could be re-utilized (for example token's local addresses, symbol and decimals in evm chains)
  abstract warmup(): Promise<void>;

  // Should return balances for a native address in the chain
  abstract pullNativeBalance(address: string): Promise<WalletBalance>;

  // Should return balances for tokens in the list for the address specified
  abstract pullTokenBalances(address: string, tokens: string[]): Promise<WalletBalance[]>;

  constructor(
    protected network: string,
    protected chainName: string,
    protected rawConfig: WalletConfig[],
    options?: WalletOptions,
  ) {
    this.validateNetwork(network);
    this.validateChainName(chainName);
    this.validateOptions(options);


    this.logger = this.getLogger(options?.logger);

    this.configs = rawConfig.map((c) => {
      this.validateConfig(c);
      return {
        address: c.address,
        tokens: this.parseTokensConfig(c.tokens),
      }
    });
  }

  private getLogger(logger: any): Logger {
    if (logger && isValidLogger(logger)) return logger;
    return getSilentLogger();
  }

  protected parseConfig(config: WalletConfig): WalletConfig {
    const walletConfig = {
      address: config.address,
      tokens: this.parseTokensConfig(config.tokens),
    };

    this.logger.debug(`Parsed config: ${JSON.stringify(walletConfig)}`);

    return walletConfig;
  }

  public async pullBalances(): Promise<WalletBalance[]> {
    if (!this.warm) {
      this.logger.debug("Warming up wallet toolbox...")
      await this.warmup();
      this.warm = true;
    }

    const balances: WalletBalance[] = [];

    for (const config of this.configs) {
      const { address, tokens } = config;

      this.logger.info(`Pulling balances for ${address}...`);

      try {
        const nativeBalance = await this.pullNativeBalance(address);
        balances.push(nativeBalance);

        this.logger.debug(`Balances for ${address} pulled: ${JSON.stringify(nativeBalance)}`)
      } catch (error) {
        this.logger.error(`Error pulling native balance for ${address}: ${error}`);
      }

      if (!tokens || tokens.length === 0) {
        this.logger.debug(`No token balances to pull for ${address}`);
        continue;
      }

      this.logger.debug(`Pulling tokens (${tokens.join(', ')}) for ${address}...`);

      try {
        const tokenBalances = await this.pullTokenBalances(address, tokens);

        this.logger.debug(`Token balances for ${address} pulled: ${JSON.stringify(tokenBalances)}`);

        balances.push(...tokenBalances);
      } catch (error) {
        this.logger.error(`Error pulling token balances for ${address}: ${error}`);
      }
    }

    return balances;
  }
}
