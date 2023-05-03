import { JsonRpcProvider, Connection } from '@mysten/sui.js';

import { WalletConfig, WalletBalance, TokenBalance } from '../';
import { WalletToolbox, BaseWalletOptions, TransferRecepit } from '../base-wallet';
import { pullSuiNativeBalance, pullSuiTokenBalance } from '../../balances/sui';

import { SUI_CHAIN_CONFIG, SUI, SuiDefaultConfig } from './sui.config';
import { getSuiAddressFromPrivateKey } from '../../balances/sui';

export const SUI_CHAINS = {
  [SUI]: 1,
}

export const SUI_CHAIN_CONFIGS: Record<SuiChainName, SuiChainConfig> = {
  [SUI]: SUI_CHAIN_CONFIG,
};

export type SuiWalletOptions = BaseWalletOptions & {
  nodeUrl: string,
  faucetUrl?: string,
};

export type SuiChainConfig = {
  chainName: string;
  nativeCurrencySymbol: string;
  knownTokens: Record<string, Record<string, string>>;
  defaultConfigs: Record<string, { nodeUrl: string }>;
  networks: Record<string, number>;
  defaultNetwork: string;
};

export type SuiDefaultConfigs = Record<string, SuiDefaultConfig>;

export type SuiChainName = keyof typeof SUI_CHAINS;

export class SuiWalletToolbox extends WalletToolbox {
  provider: Connection;
  private chainConfig: SuiChainConfig;
  private tokenData: Record<string, any> = {};
  public options: SuiWalletOptions;

  constructor(
    public network: string,
    public chainName: SuiChainName,
    public rawConfig: WalletConfig[],
    options: SuiWalletOptions,
  ) {
    super(network, chainName, rawConfig, options);
    this.chainConfig = SUI_CHAIN_CONFIGS[this.chainName];

    const defaultOptions = this.chainConfig.defaultConfigs[this.network];

    this.options = { ...defaultOptions, ...options } as SuiWalletOptions;

    this.logger.debug(`SUI rpc url: ${this.options.nodeUrl}`);

    this.provider = new Connection({
      fullnode: this.options.nodeUrl
    });
  }

  public validateChainName(chainName: any): chainName is SuiChainName {
    if (chainName !== SUI) throw new Error(`Invalid chain name "${chainName}" for SUI wallet`);
    return true;
  }

  public validateNetwork(network: string) {
    if (!(network in SUI_CHAIN_CONFIGS[this.chainName].networks))
      throw new Error(`Invalid network "${network}" for chain: ${this.chainName}`);
    return true;
  }

  public validateOptions(options: any) {
    if (!options) return true;
    if (typeof options !== 'object') throw new Error(`Invalid options for chain: ${this.chainName}`);
    return true;
  }

  validateTokenAddress(token: any): boolean {
    const chainConfig = SUI_CHAIN_CONFIGS[this.chainName];

    if (typeof token !== 'string')
      throw new Error(`Invalid config for chain: ${this.chainName}: Invalid token`);

    if ((token.toUpperCase() in chainConfig.knownTokens[this.network])) return true;

    // TODO: find a way to validate the hex string:
    return true;
  }

  public parseTokensConfig(tokens: WalletConfig['tokens']): string[] {
    const knownTokens = SUI_CHAIN_CONFIGS[this.chainName].knownTokens[this.network];
    return tokens ? tokens.map((token) => {
      if (token.toUpperCase() in knownTokens) {
        return knownTokens[token.toUpperCase()];
      }

      else return token;
    }) : [];
  }

  public async warmup(){
    
  }

  public async pullNativeBalance(address: string): Promise<WalletBalance> {
    const balance = await pullSuiNativeBalance(this.provider, address);
    const formattedBalance = String(+balance.rawBalance / 10 ** 9);
    return {
      ...balance,
      address,
      formattedBalance,
      tokens: [],
      symbol: this.chainConfig.nativeCurrencySymbol,
    }
  }

  public async pullTokenBalances(address: string, tokens: string[]): Promise<TokenBalance[]> {
    throw new Error('pullTokenBalances is not yet implemented for SUI wallet');
  }

  public async transferNativeBalance(privateKey: string, targetAddress: string, amount: number, maxGasPrice?: number, gasLimit?: number): Promise<TransferRecepit> {
    throw new Error('Balance transfer is not yet implemented for SUI wallet');
  }

  public getAddressFromPrivateKey(privateKey: string): string {
    return getSuiAddressFromPrivateKey(privateKey);
  }
}

