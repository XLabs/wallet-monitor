import { Balance } from '../balances';
import { WalletOptions } from './';
import { isEvmChain, EvmChainNames, isSolanaChain, EvmChainIds, chainNameToWormholeId, KnownChainNames, KnownChainIds } from '../wallets/wormhole-related-utils';

export type WalletConfig = {
  address: string;
  tokens: string[];
  options?: WalletOptions;
}


export abstract class WalletToolbox {
  private warm = false;

  protected configs: any[];
  protected wormholeChainId: KnownChainIds;
  
  abstract validateConfig(rawConfig: WalletConfig[]): void;

  // Should parse an address received from the user.
  // The address returned should be a public address used by the chain client
  // Example: 
  abstract parseAddressConfig(address: WalletConfig["address"]): string;

  // Should parse tokens received from the user.
  // The tokens returned should be a list of token addresses used by the chain client
  // Example: ["ETH", "USDC"] => ["0x00000000", "0x00000001"];
  abstract parseTokensConfig(tokens: WalletConfig["tokens"]): string[];

  // warmup should:
  // instantiate provider for the chain
  // calculate data which could be re-utilized (for example token's local addresses, symbol and decimals in evm chains)
  abstract warmup: () => Promise<void>;

  // Should return balances for all addresses stored in the "configs" property;
  abstract pull(): Promise<Balance[]>;

  constructor(chainName: KnownChainNames, protected rawConfig: WalletConfig[]) {
    this.wormholeChainId = chainNameToWormholeId(chainName);
    this.validateConfig(rawConfig);
    this.configs = this.parseConfig(rawConfig);
  }

  protected parseConfig(rawConfig: WalletConfig[]): WalletConfig[] {
    return rawConfig.map((config: WalletConfig) => {
      return {
        address: this.parseAddressConfig(config.address),
        tokens: this.parseTokensConfig(config.tokens),
      }
    });
  }

  public async pullBalances(): Promise<Balance[]> {
    if (!this.warm) {
      await this.warmup();
      this.warm = true;
    }

    return this.pull();
  };
}
