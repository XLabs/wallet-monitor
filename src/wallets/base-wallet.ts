import { WalletBalance, WalletOptions, WalletConfig } from ".";

console.log("Hello, world!")
export abstract class WalletToolbox {
  private warm = false;
  protected configs: WalletConfig[];
  protected options: WalletOptions;

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
    options: WalletOptions,
  ) {
    this.validateNetwork(network);

    this.validateChainName(chainName);

    if (options) {
      this.validateOptions(options);
    }

    this.options = options;

    this.configs = rawConfig.map((c) => {
      this.validateConfig(c);
      return {
        address: c.address,
        tokens: this.parseTokensConfig(c.tokens),
      }
    });
  }

  protected parseConfig(config: WalletConfig): WalletConfig {
    return {
      address: config.address,
      tokens: this.parseTokensConfig(config.tokens),
    }
  }

  public async pullBalances(): Promise<WalletBalance[]> {
    if (!this.warm) {
      await this.warmup();
      this.warm = true;
    }

    const balances: WalletBalance[] = [];

    for (const config of this.configs) {
      const { address, tokens } = config;

      try {
        const nativeBalance = await this.pullNativeBalance(address);
        balances.push(nativeBalance);
      } catch (error) {
        console.log(`Error pulling native balance for ${address}: ${error}`);
      }

      if (!tokens || tokens.length === 0) continue;

      try {
        const tokenBalances = await this.pullTokenBalances(address, tokens);
        balances.push(...tokenBalances);
      } catch (error) {
        console.log(`Error pulling token balances for ${address}: ${error}`)
      }
    }

    return balances;
  }
}
