import { Connection, Ed25519Keypair, RawSigner, JsonRpcProvider } from "@mysten/sui.js";

import { WalletConfig, WalletBalance, TokenBalance } from "../";
import {
  WalletToolbox,
  BaseWalletOptions,
  TransferReceipt, WalletData,
} from "../base-wallet";
import { 
  SuiTokenData, 
  pullSuiNativeBalance, 
  pullSuiTokenBalances, 
  pullSuiTokenData, 
  transferSuiNativeBalance
} from "../../balances/sui";

import {
  SUI_CHAIN_CONFIG,
  SUI,
  SuiDefaultConfig,
} from "./sui.config";
import { getSuiAddressFromPrivateKey } from "../../balances/sui";
import {mapConcurrent} from "../../utils";
import { formatFixed } from "@ethersproject/bignumber";
import { PriceFeed } from "../../wallet-manager";
import { coinGeckoIdByChainName } from "../../price-assistant/supported-tokens.config";

export const SUI_CHAINS = {
  [SUI]: 1,
};

export const SUI_CHAIN_CONFIGS: Record<SuiChainName, SuiChainConfig> = {
  [SUI]: SUI_CHAIN_CONFIG,
};

export type SuiWalletOptions = BaseWalletOptions & {
  nodeUrl: string;
  faucetUrl?: string;
  tokenPollConcurrency?: number | undefined;
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
export type SuiWallet = RawSigner;
export type SuiProvider = Connection;

const SUI_HEX_ADDRESS_REGEX = /^0x[a-fA-F0-9]{64}::\w+::\w+$/;

export class SuiWalletToolbox extends WalletToolbox {
  private connection: Connection;
  private chainConfig: SuiChainConfig;
  private tokenData: Record<string, SuiTokenData> = {};
  private options: SuiWalletOptions;
  private priceFeed?: PriceFeed;

  constructor(
    public network: string,
    public chainName: SuiChainName,
    public rawConfig: WalletConfig[],
    options: SuiWalletOptions,
    priceFeed?: PriceFeed
  ) {
    super(network, chainName, rawConfig, options);
    this.chainConfig = SUI_CHAIN_CONFIGS[this.chainName];

    const defaultOptions = this.chainConfig.defaultConfigs[this.network];

    this.options = { ...defaultOptions, ...options } as SuiWalletOptions;
    this.priceFeed = priceFeed;

    const nodeUrlOrigin = this.options.nodeUrl && new URL(this.options.nodeUrl).origin
    this.logger.debug(`SUI rpc url: ${nodeUrlOrigin}`);

    this.connection = new Connection({
      fullnode: this.options.nodeUrl,
    });
  }

  protected validateChainName(chainName: any): chainName is SuiChainName {
    if (chainName !== SUI)
      throw new Error(`Invalid chain name "${chainName}" for SUI wallet`);
    return true;
  }

  protected validateNetwork(network: string) {
    if (!(network in SUI_CHAIN_CONFIGS[this.chainName].networks))
      throw new Error(
        `Invalid network "${network}" for chain: ${this.chainName}`
      );
    return true;
  }

  protected validateOptions(options: any) {
    if (!options) return true;
    if (typeof options !== "object")
      throw new Error(`Invalid options for chain: ${this.chainName}`);
    return true;
  }

  protected validateTokenAddress(token: string): boolean {
    if (!this.isValidNativeTokenAddress(token)) {
      throw new Error(`Invalid token address: ${token}`);
    }

    if (!(this.isKnownToken(token))) {
      throw new Error(`Unknown token address: ${token}`);
    }
    return true;
  }

  protected parseTokensConfig(tokens: string[], failOnInvalidTokens: boolean): string[] {
    const validTokens: string[] = [];
    for (const token of tokens) {
      if (this.isValidNativeTokenAddress(token)) {
        validTokens.push(token);
      } else if (this.isKnownToken(token)) {
        validTokens.push(this.getKnownTokenAddress(token));
      } else if (failOnInvalidTokens) {
        throw new Error(`Invalid token address: ${token}`);
      }
    }
    return validTokens;
  }

  private getKnownTokenAddress(token: string): string {
    return this.getKnownTokens()[token.toUpperCase()];
  }

  private getKnownTokens(): Record<string, string> {
    return SUI_CHAIN_CONFIGS[this.chainName].knownTokens[this.network];
  }

  private isKnownToken(token: string): boolean {
    return token.toUpperCase() in this.getKnownTokens();
  }
  
  protected async warmup() {
    const tokens = this.walletTokens(this.wallets);
    await mapConcurrent(tokens, async (tokenAddress: string): Promise<void> => {
      // tokens has addresses, per this.parseTokensConfig() contract
      const tokenData = await pullSuiTokenData(this.connection, tokenAddress);
      this.tokenData[tokenAddress] = tokenData;
    }, 1);

    this.logger.debug(`Sui token data: ${JSON.stringify(this.tokenData)}`);
  }

  private walletTokens(wallets: Record<string, WalletData>): string[] {
    const walletData = Object.values(wallets);

    return walletData.reduce((tokens: string[], wallet: WalletData): string[] => {
      return wallet.tokens ? [...tokens, ...wallet.tokens] : [...tokens]
    }, [] as string[]);
  }

  public async pullNativeBalance(address: string, blockHeight?: number): Promise<WalletBalance> {
    const balance = await pullSuiNativeBalance(this.connection, address);
    const formattedBalance = String(+balance.rawBalance / 10 ** 9);

    if (blockHeight) {
      this.logger.warn(`Sui does not support pulling balances by block height, ignoring blockHeight: ${blockHeight}`);
    }
    
    // Pull prices in USD for all the native tokens in single network call
    await this.priceFeed?.pullTokenPrices();
    const coingeckoId = coinGeckoIdByChainName[this.chainName];
    const tokenUsdPrice = this.priceFeed?.getKey(coingeckoId);
    
    return {
      ...balance,
      address,
      formattedBalance,
      tokens: [],
      symbol: this.chainConfig.nativeCurrencySymbol,
      blockHeight,
      ...(tokenUsdPrice && {
        balanceUsd: Number(formattedBalance) * tokenUsdPrice,
        tokenUsdPrice
      })
    };
  }

  public async pullTokenBalances(
    address: string,
    tokens: string[]
  ): Promise<TokenBalance[]> {
    const uniqueTokens = [...new Set(tokens)];
    const allBalances = await pullSuiTokenBalances(this.connection, address);
    // Pull prices in USD for all the tokens in single network call
    const tokenPrices = await this.priceFeed?.pullTokenPrices();

    return uniqueTokens.map(tokenAddress => {
      const tokenData = this.tokenData[tokenAddress];
      const symbol: string = tokenData?.symbol ? tokenData.symbol : "";

      const balance = allBalances.find(balance => balance.coinType === tokenData.address);
      if (!balance) {
        return {
          tokenAddress,
          address,

          isNative: false,
          rawBalance: "0",
          formattedBalance: "0",
          symbol,
        }
      }

      const tokenDecimals = tokenData?.decimals ?? 9;
      const formattedBalance = formatFixed(
          balance.totalBalance,
          tokenDecimals
      );

      const coinGeckoId = this.priceFeed?.getCoinGeckoId(tokenAddress);
      const tokenUsdPrice = coinGeckoId && tokenPrices?.[coinGeckoId];

      return {
        tokenAddress,
        address,
        isNative: false,
        rawBalance: balance.totalBalance,
        formattedBalance,
        symbol,
        ...(tokenUsdPrice && {
          balanceUsd: Number(formattedBalance) * tokenUsdPrice,
          tokenUsdPrice
        })
      };
    });
  }

  protected async transferNativeBalance(
    privateKey: string,
    targetAddress: string,
    amount: number,
    maxGasPrice?: number,
    gasLimit?: number
  ): Promise<TransferReceipt> {
    const txDetails = { targetAddress, amount, maxGasPrice, gasLimit };
    return transferSuiNativeBalance(this.connection, privateKey, txDetails);
  }

  protected async getRawWallet (privateKey: string) {
    const suiPrivateKeyAsBuffer = Buffer.from(privateKey, "base64");
    const keyPair = Ed25519Keypair.fromSecretKey(suiPrivateKeyAsBuffer);
    const suiJsonProvider = new JsonRpcProvider(this.connection);
    return new RawSigner(keyPair, suiJsonProvider);
  }

  public async getGasPrice () {
    const suiJsonProvider = new JsonRpcProvider(this.connection);
    const gasPrice = await suiJsonProvider.getReferenceGasPrice();
    return gasPrice;
  }

  protected getAddressFromPrivateKey(privateKey: string): string {
    return getSuiAddressFromPrivateKey(privateKey);
  }

  protected isValidNativeTokenAddress(token: string): boolean {
    return SUI_HEX_ADDRESS_REGEX.test(token)
  }

  public async getBlockHeight(): Promise<number> {
    const suiJsonProvider = new JsonRpcProvider(this.connection);
    const sequenceNumber = await suiJsonProvider.getLatestCheckpointSequenceNumber();
    return Number(sequenceNumber);
  }
}
