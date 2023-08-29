import { Connection } from "@mysten/sui.js";

import { WalletConfig, WalletBalance, TokenBalance } from "../";
import {
  WalletToolbox,
  BaseWalletOptions,
  TransferRecepit, WalletData,
} from "../base-wallet";
import { pullSuiNativeBalance, pullSuiTokenBalances, pullSuiTokenData, transferSuiNativeBalance } from "../../balances/sui";

import {
  SUI_CHAIN_CONFIG,
  SUI,
  SuiDefaultConfig,
} from "./sui.config";
import { getSuiAddressFromPrivateKey } from "../../balances/sui";
import {mapConcurrent} from "../../utils";
import { formatFixed } from "@ethersproject/bignumber";

export const SUI_CHAINS = {
  [SUI]: 1,
};

export const SUI_CHAIN_CONFIGS: Record<SuiChainName, SuiChainConfig> = {
  [SUI]: SUI_CHAIN_CONFIG,
};

export type SuiWalletOptions = BaseWalletOptions & {
  nodeUrl: string;
  faucetUrl?: string;
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

// TODO: See other token types
const SUI_HEX_ADDRESS_REGEX = /^0x[a-fA-F0-9]{64}::coin::COIN$/;

export class SuiWalletToolbox extends WalletToolbox {
  provider: Connection;
  private chainConfig: SuiChainConfig;
  private tokenData: Record<string, any> = {};
  public options: SuiWalletOptions;

  constructor(
    public network: string,
    public chainName: SuiChainName,
    public rawConfig: WalletConfig[],
    options: SuiWalletOptions
  ) {
    super(network, chainName, rawConfig, options);
    this.chainConfig = SUI_CHAIN_CONFIGS[this.chainName];

    const defaultOptions = this.chainConfig.defaultConfigs[this.network];

    this.options = { ...defaultOptions, ...options } as SuiWalletOptions;

    this.logger.debug(`SUI rpc url: ${this.options.nodeUrl}`);

    this.provider = new Connection({
      fullnode: this.options.nodeUrl,
    });
  }

  public validateChainName(chainName: any): chainName is SuiChainName {
    if (chainName !== SUI)
      throw new Error(`Invalid chain name "${chainName}" for SUI wallet`);
    return true;
  }

  public validateNetwork(network: string) {
    if (!(network in SUI_CHAIN_CONFIGS[this.chainName].networks))
      throw new Error(
        `Invalid network "${network}" for chain: ${this.chainName}`
      );
    return true;
  }

  public validateOptions(options: any) {
    if (!options) return true;
    if (typeof options !== "object")
      throw new Error(`Invalid options for chain: ${this.chainName}`);
    return true;
  }

  validateTokenAddress(token: string): boolean {
    if (!this.isValidNativeTokenAddress(token)) {
      throw new Error(`Invalid token address: ${token}`);
    }

    if (!(this.isKnownToken(token))) {
      throw new Error(`Unknown token address: ${token}`);
    }
    return true;
  }

  public parseTokensConfig(tokens: string[], failOnInvalidTokens: boolean): string[] {
    const knownTokens = this.getKnownTokens();
    const validTokens: string[] = [];
    for (const token of tokens) {
      if (this.isValidNativeTokenAddress(token)) {
        validTokens.push(token);
      } else if (this.isKnownToken(token)) {
        validTokens.push(token.toUpperCase());
      } else if (failOnInvalidTokens) {
        throw new Error(`Invalid token address: ${token}`);
      }
    }
    return validTokens;
  }

  private getKnownTokens(): Record<string, string> {
    return SUI_CHAIN_CONFIGS[this.chainName].knownTokens[this.network];
  }

  private isKnownToken(token: string): boolean {
    return token.toUpperCase() in this.getKnownTokens();
  }
  
  public async warmup() {
    const tokens = this.walletTokens(this.wallets);
    await mapConcurrent(tokens, async (token: string): Promise<void> => {
      // token can be stored as symbol or address, so we normalize to address here
      const tokenAddress = this.isKnownToken(token) ? this.getKnownTokens()[token] : token; 
      this.tokenData[tokenAddress] = await pullSuiTokenData(this.provider, tokenAddress);
    }, 1);

    this.logger.debug(`Sui token data: ${JSON.stringify(this.tokenData)}`);
  }

  walletTokens(wallets: Record<string, WalletData>): string[] {
    const walletData = Object.values(wallets);

    return walletData.reduce((tokens: string[], wallet: WalletData): string[] => {
      return wallet.tokens ? [...tokens, ...wallet.tokens] : [...tokens]
    }, [] as string[]);
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
    };
  }

  public async pullTokenBalances(
    address: string,
    tokens: string[]
  ): Promise<TokenBalance[]> {
    const uniqueTokens = [...new Set(tokens)];
    const allBalances = await pullSuiTokenBalances(this.provider, address);

    return uniqueTokens.map((tokenAddress: string) => {
      const tokenData = this.tokenData[tokenAddress];
      const symbol: string = tokenData?.symbol ? tokenData.symbol : "";

      for (const balance of allBalances) {
        if (balance.coinType === tokenAddress) {

          const formattedBalance = formatFixed(
              balance.totalBalance,
              tokenData?.decimals ? tokenData.decimals : 9
          );

          return {
            tokenAddress,
            address,
            isNative: false,
            rawBalance: balance.totalBalance,
            formattedBalance,
            symbol,
          };
        }
      }

      return {
        tokenAddress,
        address,
        isNative: false,
        rawBalance: "0",
        formattedBalance: "0",
        symbol,
      }
    });
  }

  public async transferNativeBalance(
    privateKey: string,
    targetAddress: string,
    amount: number,
    maxGasPrice?: number,
    gasLimit?: number
  ): Promise<TransferRecepit> {
    const txDetails = { targetAddress, amount, maxGasPrice, gasLimit };
    return transferSuiNativeBalance(this.provider, privateKey, txDetails);
  }

  public getAddressFromPrivateKey(privateKey: string): string {
    return getSuiAddressFromPrivateKey(privateKey);
  }

  public isValidNativeTokenAddress(token: string): boolean {
    return SUI_HEX_ADDRESS_REGEX.test(token)
  }
}
