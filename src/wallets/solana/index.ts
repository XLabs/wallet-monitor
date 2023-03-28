import {SOLANA, SOLANA_CHAIN_CONFIG} from "./solana.config";
import {PYTHNET, PYTHNET_CHAIN_CONFIG} from "./pythnet.config";
import {BaseWalletOptions, Logger, WalletToolbox} from "../base-wallet";
import {WalletBalance, WalletConfig, WalletOptions} from "../index";


type SolanaChainConfig = {
  chainName: string;
  nativeCurrencySymbol: string;
  knownTokens: Record<string, Record<string, string>>;
  defaultConfigs: Record<string, { nodeUrl: string }>;
  networks: Record<string, number>;
}

export const SOLANA_CHAINS = {
  [SOLANA]: 1,
  [PYTHNET]: 2,
};


export type SolanaChainName = keyof typeof SOLANA_CHAINS;


export const SOLANA_CHAIN_CONFIGS: Record<SolanaChainName, SolanaChainConfig> = {
  [SOLANA]: SOLANA_CHAIN_CONFIG,
  [PYTHNET]: PYTHNET_CHAIN_CONFIG,
}

export type SolanaWalletOptions = BaseWalletOptions & {
  nodeUrl?: string;
  tokenPollConcurrency?: number;
}

export class SolanaWalletToolbox extends WalletToolbox {

  constructor(
    protected network: string,
    protected chainName: SolanaChainName,
    protected rawConfig: WalletConfig[],
    options?: WalletOptions,
    logger?: Logger,
  ) {
    super(network, chainName, rawConfig, options, logger);


  }
  parseTokensConfig(tokens: string[]): string[] {
    return [];
  }

  pullNativeBalance(address: string): Promise<WalletBalance> {
    return Promise.resolve(undefined);
  }

  pullTokenBalances(address: string, tokens: string[]): Promise<WalletBalance[]> {
    return Promise.resolve([]);
  }

  validateChainName(chainName: string): chainName is SolanaChainName {
    if (!(chainName in SOLANA_CHAIN_CONFIGS)) throw new Error(`Invalid chain name "${chainName}" for Solana wallet`);
    return true;
  }

  validateConfig(rawConfig: any): boolean {
    return false;
  }

  validateNetwork(network: string): boolean {
     if (!(network in SOLANA_CHAIN_CONFIGS[this.chainName].networks)) throw new Error(`Invalid network "${network}" for chain: ${this.chainName}`);
    return true;
  }

  validateOptions(options: any): boolean {
    return false;
  }

  warmup(): Promise<void> {
    return Promise.resolve(undefined);
  }

}
