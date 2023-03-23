import { ethers } from 'ethers';
import { WalletConfig, WalletBalance } from '../';
import { WalletToolbox } from '../base-wallet';
import { pullEvmNativeBalance } from '../../balances/evm';

import { EthereumNetworks, ETHEREUM_CHAIN_CONFIG, ETHEREUM } from './ethereum.config';
import { POLYGON, POLYGON_CHAIN_CONFIG } from './polygon.config';
import { AVALANCHE, AVALANCHE_CHAIN_CONFIG } from './avalanche.config';

const EVM_HEX_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

type EvmChainConfig = {
  chainName: string;
  nativeCurrencySymbol: string;
  knownTokens: Record<string, Record<string, string>>;
  defaultConfigs: Record<string, { nodeUrl: string }>;
  networks: Record<string, number>;
}

type EvmWalletConfig = {
  address: string;
  tokens: string[];
}

export const EVM_CHAINS = {
  [ETHEREUM]: ETHEREUM_CHAIN_CONFIG,
  [POLYGON]: POLYGON_CHAIN_CONFIG,
  [AVALANCHE]: AVALANCHE_CHAIN_CONFIG,
};

export type EvmWalletOptions = {
  nodeUrl: string;
}

export type EvmNetworks = EthereumNetworks // | PolygonNetworks | AvalancheNetworks;

export type EVMChainName = keyof typeof EVM_CHAINS;

export class EvmWalletToolbox extends WalletToolbox {
  private provider: ethers.providers.JsonRpcProvider;
  private nativeCurrencyName: string;
  private chainConfig: EvmChainConfig;

  constructor (
    public network: string,
    public chainName: EVMChainName,
    public rawConfig: WalletConfig[],
    public options: EvmWalletOptions,
  ) {
    super(network, chainName, rawConfig, options);
    this.chainConfig = EVM_CHAINS[this.chainName];

    const defaultOptions = this.chainConfig.defaultConfigs[this.network];

    this.options = {
      ...defaultOptions,
      ...options,
    };

    this.provider = new ethers.providers.JsonRpcProvider(this.options.nodeUrl);
    this.nativeCurrencyName = this.chainConfig.nativeCurrencySymbol;
  }

  public validateChainName(chainName: string): chainName is EVMChainName {
    if (!(chainName in EVM_CHAINS)) throw new Error(`Invalid chain name "${chainName}" for EVM wallet`);
    return true;
  }

  public validateNetwork(network: string): network is EvmNetworks {
    if (!(network in EVM_CHAINS[this.chainName].networks)) throw new Error(`Invalid network "${network}" for chain: ${this.chainName}`);
    return true;
  }

  public validateOptions(options: any): options is EvmWalletOptions {
    if (!options) return true;
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
        
        if (!EVM_HEX_ADDRESS_REGEX.test(token) && !(token in this.chainConfig.knownTokens[this.network]))
          throw new Error(`Invalid config for chain: ${this.chainName}: Invalid token`);
      });
    }

    return true;
  }

  public parseTokensConfig(tokens: EvmWalletConfig["tokens"]): string[] {
    return tokens.map((token) => {
      if (EVM_HEX_ADDRESS_REGEX.test(token)) {
        return token;  
      }

      return this.chainConfig.knownTokens[this.network][token];
    });
  }

  public async warmup() {
    // TODO
    // get and store token symbol for each token in the wallet config
    // get and store token decimals for each token in the wallet config
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