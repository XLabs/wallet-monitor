import {Connection, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js"
import {SOLANA, SOLANA_CHAIN_CONFIG, SolanaNetworks} from "./solana.config";
import {PYTHNET, PYTHNET_CHAIN_CONFIG} from "./pythnet.config";
import {BaseWalletOptions, WalletToolbox} from "../base-wallet";
import {WalletBalance, WalletConfig, WalletOptions} from "../index";
import {pullSolanaNativeBalance} from "../../balances/solana";


type SolanaChainConfig = {
  chainName: string;
  nativeCurrencySymbol: string;
  knownTokens: Record<string, Record<string, string>>;
  defaultConfigs: Record<string, { nodeUrl: string }>;
  networks: Record<string, number>;
}

type SolanaWalletConfig = {
  address: string;
  tokens: string[];
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
  private chainConfig: SolanaChainConfig;
  public options: SolanaWalletOptions;
  private connection: Connection;

  constructor(
    protected network: string,
    protected chainName: SolanaChainName,
    protected rawConfig: WalletConfig[],
    options?: WalletOptions,
  ) {
    super(network, chainName, rawConfig, options);

    this.chainConfig = SOLANA_CHAIN_CONFIGS[this.chainName];

    const defaultOptions = this.chainConfig.defaultConfigs[this.network];
    this.options = { ...defaultOptions, ...options };
    this.logger.debug(`Solana wallet options: ${JSON.stringify({ ...this.options, logger: undefined })}`);

    if (!this.options.nodeUrl)
      throw new Error(`No default node url provided.`)

    this.connection = new Connection(this.options.nodeUrl);
  }

  parseTokensConfig(tokens: SolanaWalletConfig['tokens']): string[] {
    // TODO: Figure out if this function is called after already validating that the tokens are admissible (i.e.: on curve)
    //  because if so, we could just lookup into knownTokens and if not found return the string.
    //  No need to validate twice.
    return tokens.map((token) => {
      if (PublicKey.isOnCurve(token))
        return token;
      return SOLANA_CHAIN_CONFIGS[this.chainName].knownTokens[this.network][token.toUpperCase()];
    });
  }

  async pullNativeBalance(address: string): Promise<WalletBalance> {
    const balance = await pullSolanaNativeBalance(this.connection, address);
    const formattedBalance = (Number(balance.rawBalance) / LAMPORTS_PER_SOL).toString();

    return {
      ...balance,
      address,
      formattedBalance,
      symbol: this.chainConfig.nativeCurrencySymbol
    }
  }

  async pullTokenBalances(address: string, tokens: string[]): Promise<WalletBalance[]> {
    return Promise.resolve([]);
  }

  validateChainName(chainName: string): chainName is SolanaChainName {
    if (!(chainName in SOLANA_CHAIN_CONFIGS)) throw new Error(`Invalid chain name "${chainName}" for Solana wallet`);
    return true;
  }

  validateConfig(rawConfig: any): rawConfig is SolanaWalletConfig {
    if (!rawConfig.address) throw new Error(`Invalid config for chain: ${this.chainName}: Missing address`);
    if (rawConfig.tokens && rawConfig.tokens.length) {
      const chainConfig = SOLANA_CHAIN_CONFIGS[this.chainName];

      rawConfig.tokens.forEach((token: any) => {
        if (typeof token !== 'string')
          throw new Error(`Invalid config for chain: ${this.chainName}: Invalid token`);
        if (
          PublicKey.isOnCurve(new PublicKey(token)) &&
          !(token.toUpperCase() in chainConfig.knownTokens[this.network])
        ) {
          throw new Error(`Invalid token config for chain: ${this.chainName}: Invalid token "${token}"`);
        }
      })
    }

    return true;
  }

  validateNetwork(network: string): network is SolanaNetworks {
     if (!(network in SOLANA_CHAIN_CONFIGS[this.chainName].networks)) throw new Error(`Invalid network "${network}" for chain: ${this.chainName}`);
    return true;
  }

  validateOptions(options: any): options is SolanaWalletOptions {
    return false;
  }

  async warmup() {}

}
