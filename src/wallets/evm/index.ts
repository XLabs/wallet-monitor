import { ethers } from 'ethers';

import { WalletConfig, WalletBalance } from '../';
import { mapConcurrent, Logger } from '../../utils';
import { WalletToolbox, BaseWalletOptions } from '../base-wallet';
import { pullEvmNativeBalance, EvmTokenData, pullEvmTokenData, pullEvmTokenBalance } from '../../balances/evm';

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

const EVM_CHAINS = {
  [ETHEREUM]: 1,
  [POLYGON]: 2,
  [AVALANCHE]: 3,
};

export type EVMChainName = keyof typeof EVM_CHAINS;

export const EVM_CHAIN_CONFIGS: Record<EVMChainName, EvmChainConfig> = {
  [ETHEREUM]: ETHEREUM_CHAIN_CONFIG,
  [POLYGON]: POLYGON_CHAIN_CONFIG,
  [AVALANCHE]: AVALANCHE_CHAIN_CONFIG,
};

export type EvmWalletOptions = BaseWalletOptions & {
  nodeUrl?: string;
  tokenPollConcurrency?: number;
}

export type EvmNetworks = EthereumNetworks // | PolygonNetworks | AvalancheNetworks;

function getUniqueTokens(wallets: EvmWalletConfig[]): string[] {
  const tokens = wallets.reduce((acc, wallet) => {
    return [...acc, ...wallet.tokens];
  }, [] as string[]);

  return [...new Set(tokens)];
}

export class EvmWalletToolbox extends WalletToolbox {
  private provider: ethers.providers.JsonRpcProvider;
  private chainConfig: EvmChainConfig;
  private tokenData: Record<string, EvmTokenData> = {};
  public options: EvmWalletOptions;

  constructor (
    public network: string,
    public chainName: EVMChainName,
    public rawConfig: WalletConfig[],
    options?: EvmWalletOptions,
  ) {
    super(network, chainName, rawConfig, options);
    
    this.chainConfig = EVM_CHAIN_CONFIGS[this.chainName];

    const defaultOptions = this.chainConfig.defaultConfigs[this.network];

    this.options = { ...defaultOptions, ...options } as EvmWalletOptions;
    
    this.provider = new ethers.providers.JsonRpcProvider(this.options.nodeUrl);
  }

  public validateChainName(chainName: string): chainName is EVMChainName {
    if (!(chainName in EVM_CHAIN_CONFIGS)) throw new Error(`Invalid chain name "${chainName}" for EVM wallet`);
    return true;
  }

  public validateNetwork(network: string): network is EvmNetworks {
    if (!(network in EVM_CHAIN_CONFIGS[this.chainName].networks)) throw new Error(`Invalid network "${network}" for chain: ${this.chainName}`);
    return true;
  }

  public validateOptions(options: any): options is EvmWalletOptions {
    if (!options) return true;
    if (typeof options !== 'object') throw new Error(`Invalid options for chain: ${this.chainName}`);
    return true;
  }

  public validateConfig(rawConfig: WalletConfig): rawConfig is EvmWalletConfig {
    if (!rawConfig.address) throw new Error(`Invalid config for chain: ${this.chainName}: Missing address`);
    if (rawConfig.tokens && rawConfig.tokens.length) {
      const chainConfig = EVM_CHAIN_CONFIGS[this.chainName];

      rawConfig.tokens.forEach((token) => {
        if (typeof token !== 'string')
          throw new Error(`Invalid config for chain: ${this.chainName}: Invalid token`);
        if (
          !EVM_HEX_ADDRESS_REGEX.test(token) &&
          !(token.toUpperCase() in chainConfig.knownTokens[this.network])
        ) {
          throw new Error(`Invalid token config for chain: ${this.chainName}: Invalid token "${token}"`);
        }
      });
    }

    return true;
  }

  public parseTokensConfig(tokens: EvmWalletConfig["tokens"]): string[] {
    return tokens.map((token) => {
      if (EVM_HEX_ADDRESS_REGEX.test(token)) {
        return token;  
      }
      return EVM_CHAIN_CONFIGS[this.chainName].knownTokens[this.network][token.toUpperCase()];
    });
  }

  public async warmup() {
    const uniqueTokens = getUniqueTokens(this.configs);

    await mapConcurrent(uniqueTokens, async (tokenAddress) => {
      this.tokenData[tokenAddress] = await pullEvmTokenData(this.provider, tokenAddress);
    }, this.options.tokenPollConcurrency);

    this.logger.debug(`EVM token data: ${JSON.stringify(this.tokenData)}`);
  }

  public async pullNativeBalance(address: string): Promise<WalletBalance> {
    const balance = await pullEvmNativeBalance(this.provider, address);
    const formattedBalance = ethers.utils.formatEther(balance.rawBalance);
    return {
      ...balance,
      address,
      formattedBalance,
      symbol: this.chainConfig.nativeCurrencySymbol,
    }
  }

  public async pullTokenBalances(address: string, tokens: string[]): Promise<WalletBalance[]> {
    return mapConcurrent(tokens, async (tokenAddress) => {
      const tokenData = this.tokenData[tokenAddress];
      const balance = await pullEvmTokenBalance(this.provider, tokenAddress, address);
      const formattedBalance = ethers.utils.formatUnits(balance.rawBalance, tokenData.decimals);
      return {
        ...balance,
        address,
        formattedBalance,
        symbol: tokenData.symbol,
      };
    }, this.options.tokenPollConcurrency);
  }
}
