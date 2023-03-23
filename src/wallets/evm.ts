import { ethers } from 'ethers';
import { WalletConfig } from '.';
import { WalletToolbox } from './base-wallet';
import { Balance } from '../balances';
import { EVMChainName } from './chains';

export type EvmWalletOptions = {
  nodeUrl: string;
}

const EVM_HEX_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

const EVM_MAINNET = 'mainnet';
const EVM_RINKEBY = 'rinkeby';
const EVM_ROPSTEN = 'ropsten';
const EVM_GOERLI = 'goerli';

const EVM_NETWORKS = {
  [EVM_MAINNET]: 1,
  [EVM_RINKEBY]: 2,
  [EVM_ROPSTEN]: 3,
  [EVM_GOERLI]: 4,
};

export type EvmNetworks = keyof typeof EVM_NETWORKS;

const EVM_KNOWN_TOKENS = {
  "USDC": {
    // TODO: This addresses were provided by copilot. Validate if they are correct
    [EVM_MAINNET]: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    [EVM_RINKEBY]: "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b",
    [EVM_ROPSTEN]: "0x07865c6e87b9f70255377e024ace6630c1eaa37f",
    [EVM_GOERLI]: "0x6b175474e89094c44da98b954eedeac495271d0f",
  },
  "DAI": {
    [EVM_MAINNET]: "0x6b175474e89094c44da98b954eedeac495271d0f",
    [EVM_RINKEBY]: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
    [EVM_ROPSTEN]: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
    [EVM_GOERLI]: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
  },
}

export class EvmWalletToolbox extends WalletToolbox {
  private provider: ethers.providers.JsonRpcProvider;
  private options: EvmWalletOptions;

  constructor(network: string, chainName: EVMChainName, wallets: WalletConfig[], options: any) {
    super(network, chainName, wallets);
    
    if (options) this.validateOptions(options);
    this.options = options;
    this.provider = new ethers.providers.JsonRpcProvider(this.options.nodeUrl);
  }

  private validateOptions(options: any): options is EvmWalletOptions {
    if (typeof options !== 'object') throw new Error(`Invalid options for chain: ${this.chainName}`);
    if (!options.nodeUrl) throw new Error(`Invalid options for chain: ${this.chainName}: Missing nodeUrl`);
    return true;
  }

  public validateNetwork(network: string): network is EvmNetworks {
    if (!(network in EVM_NETWORKS)) throw new Error(`Invalid network "${network}" for chain: ${this.chainName}`);
    return true;
  }

  public validateConfig(rawConfig: WalletConfig): void {
    if (!rawConfig.address) throw new Error(`Invalid config for chain: ${this.chainName}: Missing address`);
    if (rawConfig.tokens && rawConfig.tokens.length) {
      rawConfig.tokens.forEach((token) => {
        if (typeof token !== 'string')
          throw new Error(`Invalid config for chain: ${this.chainName}: Invalid token`);
        
        if (!EVM_HEX_ADDRESS_REGEX.test(token) && !(token in EVM_KNOWN_TOKENS))
          throw new Error(`Invalid config for chain: ${this.chainName}: Invalid token`);
      });
    }
  }

  public parseTokensConfig(tokens: string[]): string[] {
    return ['0x0000000']
  }

  public async warmup() {
    
  }

  public async pullNativeBalance(address: string): Promise<Balance> {
    const balance = await this.provider.getBalance(address);
  
    return undefined as any as Balance;
  }

  public async pullTokenBalances(address: string, tokens: string[]): Promise<Balance[]> {
    return [];
  }
}