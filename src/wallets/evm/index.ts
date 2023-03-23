import { ethers } from 'ethers';
import { WalletConfig, WalletBalance } from '../';
import { WalletToolbox } from '../base-wallet';
import { EthereumNetworks, ETHEREUM_CHAIN_CONFIG, KnownEthereumTokens, ETHEREUM_NETWORKS, ETHEREUM_KNOWN_TOKENS } from './ethereum.config';
import { pullEvmNativeBalance } from '../../balances/evm';

const EVM_HEX_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

type KnownEvmTokens = KnownEthereumTokens // | KnownPolygonTokens | KnownAvalancheTokens;

type EvmWalletConfig = {
  address: string;
  tokens: KnownEvmTokens[];
}

const EVM_NETWORKS = {
  ...ETHEREUM_NETWORKS,
  // ...POLYGON_NETWORKS,
  // ...AVALANCHE_NETWORKS,
};

const EVM_KNOWN_TOKENS = {
  ...ETHEREUM_KNOWN_TOKENS,
};

export const EVM_CHAINS = {
  ethereum: ETHEREUM_CHAIN_CONFIG,
  polygon: { nativeCurrencySymbol: 'MATIC' },
  avalanche: { nativeCurrencySymbol: 'AVAX' },
};

export type EvmWalletOptions = {
  nodeUrl: string;
}

export type EvmNetworks = EthereumNetworks // | PolygonNetworks | AvalancheNetworks;

export type EVMChainName = keyof typeof EVM_CHAINS;

console.log("building EvmWalletToolbox");
export class EvmWalletToolbox extends WalletToolbox {
  private provider: ethers.providers.JsonRpcProvider;
  private nativeCurrencyName: string;

  constructor (
    public network: string,
    public chainName: EVMChainName,
    public rawConfig: WalletConfig[],
    public options: EvmWalletOptions,
  ) {
    super(network, chainName, rawConfig, options);

    this.provider = new ethers.providers.JsonRpcProvider(this.options.nodeUrl);
    this.nativeCurrencyName = EVM_CHAINS[this.chainName].nativeCurrencySymbol;
  }

  public validateChainName(chainName: string): chainName is EVMChainName {
    if (!(chainName in EVM_CHAINS)) throw new Error(`Invalid chain name "${chainName}" for EVM wallet`);
    return true;
  }

  public validateNetwork(network: string): network is EvmNetworks {
    if (!(network in EVM_NETWORKS)) throw new Error(`Invalid network "${network}" for chain: ${this.chainName}`);
    return true;
  }

  public validateOptions(options: any): options is EvmWalletOptions {
    if (typeof options !== 'object') throw new Error(`Invalid options for chain: ${this.chainName}`);
    if (!options.nodeUrl) throw new Error(`Invalid options for chain: ${this.chainName}: Missing nodeUrl`);
    return true;
  }

  public validateConfig(rawConfig: WalletConfig): rawConfig is EvmWalletConfig {
    if (!rawConfig.address) throw new Error(`Invalid config for chain: ${this.chainName}: Missing address`);
    if (rawConfig.tokens && rawConfig.tokens.length) {
      rawConfig.tokens.forEach((token) => {
        if (typeof token !== 'string')
          throw new Error(`Invalid config for chain: ${this.chainName}: Invalid token`);
        
        if (!EVM_HEX_ADDRESS_REGEX.test(token) && !(token in EVM_KNOWN_TOKENS))
          throw new Error(`Invalid config for chain: ${this.chainName}: Invalid token`);
      });
    }

    return true;
  }

  public parseTokensConfig(tokens: EvmWalletConfig["tokens"]): string[] {
    return tokens.map((token) => {
      if (EVM_HEX_ADDRESS_REGEX.test(token)) {
        // we know for sure that network is one of EvmNetworks. Not sure why TS doesn't pick that up
        return EVM_KNOWN_TOKENS[token][this.network as EvmNetworks];
      }
      
      return token;
    });
  }

  public async warmup() {

    
  }

  public async pullNativeBalance(address: string): Promise<WalletBalance> {
    const balance = await pullEvmNativeBalance(this.provider, address);

    return {
      ...balance,
      address,
      currencyName: this.nativeCurrencyName,
    }
  }

  public async pullTokenBalances(address: string, tokens: string[]): Promise<WalletBalance[]> {
    return [];
  }
}