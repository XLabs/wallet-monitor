import { Balance } from '../balances';
import { WalletConfig } from './';
import { ChainName } from './chains';

// This class should be extended for each chain "type" (evm, solana, etc) that needs to be supported
export abstract class WalletToolbox {
  private warm = false;
  protected configs: any[];
  abstract validateNetwork(network: string): void;
  // throw an error if the config is invalid
  abstract validateConfig(rawConfig: WalletConfig): void;

  // Should parse tokens received from the user.
  // The tokens returned should be a list of token addresses used by the chain client
  // Example: ["ETH", "USDC"] => ["0x00000000", "0x00000001"];
  abstract parseTokensConfig(tokens: WalletConfig["tokens"]): string[];

  // Should instantiate provider for the chain
  // calculate data which could be re-utilized (for example token's local addresses, symbol and decimals in evm chains)
  abstract warmup(): Promise<void>;

  // Should return balances for a native address in the chain
  abstract pullNativeBalance(address: string): Promise<Balance>;

  // Should return balances for tokens in the list for the address specified
  abstract pullTokenBalances(address: string, tokens: string[]): Promise<Balance[]>;

  constructor(
    protected network: string,
    protected chainName: ChainName,
    protected rawConfig: WalletConfig[],
  ) {
    this.validateNetwork(network);
    this.configs = rawConfig.map((c) => {
      this.validateConfig(c);
      return this.parseConfig(c);
    });
  }

  protected parseConfig(config: WalletConfig): WalletConfig {
    return {
      address: config.address,
      tokens: this.parseTokensConfig(config.tokens),
      options: config.options,
    }
  }

  public async pullBalances(): Promise<Balance[]> {
    if (!this.warm) {
      await this.warmup();
      this.warm = true;
    }

    const balances: Balance[] = [];

    for (const config of this.configs) {
      const { address, tokens } = config;

      const nativeBalance = await this.pullNativeBalance(address);
      balances.push(nativeBalance);

      if (tokens.length > 0) {
        const tokenBalances = await this.pullTokenBalances(address, tokens);
        balances.push(...tokenBalances);
      }
    }
    
    return balances;
  }
}
