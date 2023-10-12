import { Connection, LAMPORTS_PER_SOL, PublicKey, Keypair, RecentPrioritizationFees } from "@solana/web3.js"
import { decode } from "bs58";
import { SOLANA, SOLANA_CHAIN_CONFIG, SolanaNetworks } from "./solana.config";
import { PYTHNET, PYTHNET_CHAIN_CONFIG } from "./pythnet.config";
import { BaseWalletOptions, TransferRecepit, WalletToolbox } from "../base-wallet";
import { WalletBalance, TokenBalance, WalletConfig, WalletOptions } from "../index";
import { pullSolanaNativeBalance, getSolanaAddressFromPrivateKey } from "../../balances/solana";
import { getMint, Mint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { findMedian, mapConcurrent } from "../../utils";


export type SolanaChainConfig = {
  chainName: string;
  nativeCurrencySymbol: string;
  knownTokens: Record<string, Record<string, string>>;
  defaultConfigs: Record<string, { nodeUrl: string }>;
  networks: Record<string, number>;
  defaultNetwork: string;
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
export type SolanaWallet = {
  conn: Connection;
  payer: Keypair;
};
export type SolanaProvider = Connection;

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
  private options: SolanaWalletOptions;
  private tokenData: Record<string, Mint> = {};
  private connection: Connection;

  constructor(
    public network: string,
    public chainName: SolanaChainName,
    public rawConfig: WalletConfig[],
    options: WalletOptions,
  ) {
    super(network, chainName, rawConfig, options);

    this.chainConfig = SOLANA_CHAIN_CONFIGS[this.chainName];

    const defaultOptions = this.chainConfig.defaultConfigs[this.network];
    this.options = { ...defaultOptions, ...options };

    if (!this.options.nodeUrl)
      throw new Error(`No default node url provided.`)

    this.connection = new Connection(this.options.nodeUrl);
  }

  parseTokensConfig(tokens: SolanaWalletConfig['tokens'], failOnInvalidTokens: boolean): string[] {
    const knownTokens = SOLANA_CHAIN_CONFIGS[this.chainName].knownTokens[this.network];
    const validTokens: string[] = [];
    for (const token of tokens) {
      if (token.toUpperCase() in knownTokens)
        validTokens.push(knownTokens[token.toUpperCase()]);
      else if (this.isValidTokenNativeAddress(token))
        validTokens.push(token);
      else if (failOnInvalidTokens)
        throw new Error('Invalid Token Config for Solana: ' + token);
    }

    return validTokens;
  }

  public async pullNativeBalance(address: string): Promise<WalletBalance> {
    const balance = await pullSolanaNativeBalance(this.connection, address);
    const formattedBalance = (Number(balance.rawBalance) / LAMPORTS_PER_SOL).toString();

    return {
      ...balance,
      address,
      formattedBalance,
      tokens: [],
      symbol: this.chainConfig.nativeCurrencySymbol
    }
  }

  public async pullTokenBalances(address: string, tokens: string[]): Promise<TokenBalance[]> {
    // Because one user account could be the owner of multiple token accounts with the same mint account,
    //  we need to aggregate data and sum over the distinct mint accounts.
    const tokenBalances = await this.connection.getParsedTokenAccountsByOwner(
      new PublicKey(address),
      { programId: TOKEN_PROGRAM_ID }
    )

    // decimals field of the map value doesn't change each time, but we still put it there for convenience.
    const tokenBalancesDistinct: Map<string, number> = new Map()
    tokenBalances.value.forEach((tokenAccount) => {
      const mintAccount = tokenAccount.account.data.parsed.info.mint
      const tokenAccountBalance = tokenAccount.account.data.parsed.info.tokenAmount.amount
      tokenBalancesDistinct.set(mintAccount, (tokenBalancesDistinct.get(mintAccount) ?? 0) + tokenAccountBalance)
    })

    // Assuming that tokens[] is actually an array of mint account addresses.
    return tokens.map((token) => {
      const tokenData = this.tokenData[token];
      const tokenKnownInfo = Object
        .entries(this.chainConfig.knownTokens[this.network])
        .find(([_, value]) => value === token)
      const tokenKnownSymbol = tokenKnownInfo ? tokenKnownInfo[0] : undefined

      // We are choosing to show a balance of 0 for a token that is not owned by the address.
      const tokenBalance = tokenBalancesDistinct.get(token) ?? 0;
      return {
        isNative: false,
        rawBalance: tokenBalance.toString(),
        address,
        formattedBalance: (tokenBalance / 10 ** tokenData.decimals).toString(),
        symbol: tokenKnownSymbol ?? 'unknown',
      }
    })
  }

  protected validateChainName(chainName: string): chainName is SolanaChainName {
    if (!(chainName in SOLANA_CHAIN_CONFIGS)) throw new Error(`Invalid chain name "${chainName}" for Solana wallet`);
    return true;
  }

  protected validateTokenAddress(token: any) {
    const chainConfig = SOLANA_CHAIN_CONFIGS[this.chainName];

    if (typeof token !== 'string')
      throw new Error(`Invalid config for chain: ${this.chainName}: Invalid token`);

    if ((token.toUpperCase() in chainConfig.knownTokens[this.network])) return true;

    if (!this.isValidTokenNativeAddress(token))
      throw new Error(`Invalid token config for chain: ${this.chainName}: Invalid token "${token}"`);

    return true;
  }

  protected validateNetwork(network: string): network is SolanaNetworks {
    if (!(network in SOLANA_CHAIN_CONFIGS[this.chainName].networks)) throw new Error(`Invalid network "${network}" for chain: ${this.chainName}`);
    return true;
  }

  protected validateOptions(options: any): options is SolanaWalletOptions {
    return false;
  }

  protected async warmup() {
    const distinctTokens = [...new Set(Object.values(this.wallets).flatMap(({ address, tokens }) => {
      return tokens || [];
    }))]
    await mapConcurrent(distinctTokens, async (token) => {
      this.tokenData[token] = await getMint(this.connection, new PublicKey(token))
    }, this.options.tokenPollConcurrency)
  }

  protected async transferNativeBalance(sourceAddress: string, targetAddress: string, amount: number): Promise<TransferRecepit> {
    // TODO: implement
    throw new Error('SolanaWalletToolbox.transferNativeBalance not implemented.');
  }

  protected async getRawWallet (privateKey: string) {
    let secretKey;
      try {
        secretKey = decode(privateKey);
      } catch (e) {
        secretKey = new Uint8Array(JSON.parse(privateKey));
      }
    return {
      conn: this.connection,
      payer: Keypair.fromSecretKey(secretKey),
    } as SolanaWallet;
  }

  public async getGasPrice () {
    // see more on why use getRecentPrioritizationFees: https://docs.solana.com/transaction_fees#get-recent-prioritization-fees
    const recentBlocks = await this.connection.getRecentPrioritizationFees();
    const prioritizationFee = findMedian<RecentPrioritizationFees>(recentBlocks, (block) => block.prioritizationFee);

    return BigInt(prioritizationFee || 0n);
  }

  protected getAddressFromPrivateKey(privateKey: string): string {
    return getSolanaAddressFromPrivateKey(privateKey);
  }

  protected isValidTokenNativeAddress(token: string): boolean {
    try {
      new PublicKey(token)
    } catch (e) {
      return false;
    }
    return true;
  }
}