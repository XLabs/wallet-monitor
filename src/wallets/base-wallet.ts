import { Balance } from '../balances';
import { WalletOptions, WalletConfig } from './';
import { ChainName } from './chains';


export abstract class WalletToolbox {
  private warm = false;
  protected configs: any[];

  abstract validateConfig(rawConfig: WalletConfig): void;

  // Should parse tokens received from the user.
  // The tokens returned should be a list of token addresses used by the chain client
  // Example: ["ETH", "USDC"] => ["0x00000000", "0x00000001"];
  abstract parseTokensConfig(tokens: WalletConfig["tokens"]): string[];

  // warmup should:
  // instantiate provider for the chain
  // calculate data which could be re-utilized (for example token's local addresses, symbol and decimals in evm chains)
  abstract warmup(): Promise<void>;

  // Should return balances for all addresses stored in the "configs" property;
  abstract pull(): Promise<Balance[]>;

  constructor(
    protected network: string,
    protected chainName: ChainName,
    protected rawConfig: WalletConfig[],
  ) {
    this.configs = rawConfig.map((c) => {
      this.validateConfig(c);
      this.parseConfig(c);
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

    return this.pull();
  };
}
