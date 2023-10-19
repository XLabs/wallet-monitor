import { ethers } from "ethers";

import { WalletConfig, WalletBalance, TokenBalance } from "../";
import { mapConcurrent } from "../../utils";
import { WalletToolbox, BaseWalletOptions } from "../base-wallet";
import {
  pullEvmNativeBalance,
  EvmTokenData,
  pullEvmTokenData,
  pullEvmTokenBalance,
  transferEvmNativeBalance,
  getEvmAddressFromPrivateKey,
} from "../../balances/evm";

import {
  EthereumNetwork,
  ETHEREUM_CHAIN_CONFIG,
  ETHEREUM,
} from "./ethereum.config";
import {
  PolygonNetwork,
  POLYGON,
  POLYGON_CHAIN_CONFIG,
} from "./polygon.config";
import {
  AvalancheNetwork,
  AVALANCHE,
  AVALANCHE_CHAIN_CONFIG,
} from "./avalanche.config";
import { BscNetwork, BSC, BSC_CHAIN_CONFIG } from "./bsc.config";
import { FantomNetwork, FANTOM, FANTOM_CHAIN_CONFIG } from "./fantom.config";
import { CeloNetwork, CELO, CELO_CHAIN_CONFIG } from "./celo.config";
import {
  MoonbeamNetwork,
  MOONBEAM,
  MOONBEAM_CHAIN_CONFIG,
} from "./moonbeam.config";
import {
  ArbitrumNetwork,
  ARBITRUM,
  ARBITRUM_CHAIN_CONFIG,
} from "./arbitrum.config";
import {
  OptimismNetwork,
  OPTIMISM,
  OPTIMISM_CHAIN_CONFIG,
} from "./optimism.config";
import { KlaytnNetwork, KLAYTN, KLAYTN_CHAIN_CONFIG } from "./klaytn.config";
import { BaseNetwork, BASE, BASE_CHAIN_CONFIG } from "./base.config";
import { TokenPriceFeed } from "../../price-assistant/token-price-feed";

const EVM_HEX_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export type EvmChainConfig = {
  // TODO: most of this properties should actually be in a BaseChainConfig type
  chainName: string;
  nativeCurrencySymbol: string;
  knownTokens: Record<string, Record<string, string>>;
  defaultConfigs: Record<string, { nodeUrl: string }>;
  networks: Record<string, number>;
  defaultNetwork: string;
};

const EVM_CHAINS = {
  [ETHEREUM]: 1,
  [POLYGON]: 2,
  [AVALANCHE]: 3,
  [BSC]: 4,
  [FANTOM]: 5,
  [CELO]: 6,
  [MOONBEAM]: 7,
  [ARBITRUM]: 8,
  [OPTIMISM]: 9,
  [KLAYTN]: 10,
  [BASE]: 11,
};

export type EvmDefaultConfig = {
  nodeUrl: string;
  tokenPollConcurrency?: number;
};

export type EvmDefaultConfigs = Record<string, EvmDefaultConfig>;

export type EVMChainName = keyof typeof EVM_CHAINS;
export type EVMWallet = ethers.Wallet;
export type EVMProvider = ethers.providers.JsonRpcProvider;

export const EVM_CHAIN_CONFIGS: Record<EVMChainName, EvmChainConfig> = {
  [ETHEREUM]: ETHEREUM_CHAIN_CONFIG,
  [POLYGON]: POLYGON_CHAIN_CONFIG,
  [AVALANCHE]: AVALANCHE_CHAIN_CONFIG,
  [BSC]: BSC_CHAIN_CONFIG,
  [FANTOM]: FANTOM_CHAIN_CONFIG,
  [CELO]: CELO_CHAIN_CONFIG,
  [MOONBEAM]: MOONBEAM_CHAIN_CONFIG,
  [ARBITRUM]: ARBITRUM_CHAIN_CONFIG,
  [OPTIMISM]: OPTIMISM_CHAIN_CONFIG,
  [KLAYTN]: KLAYTN_CHAIN_CONFIG,
  [BASE]: BASE_CHAIN_CONFIG,
};

export type EvmWalletOptions = BaseWalletOptions & {
  nodeUrl?: string;
  tokenPollConcurrency?: number;
};

export type EvmNetworks =
  | EthereumNetwork
  | PolygonNetwork
  | BscNetwork
  | AvalancheNetwork
  | FantomNetwork
  | CeloNetwork
  | MoonbeamNetwork
  | ArbitrumNetwork
  | OptimismNetwork
  | KlaytnNetwork
  | BaseNetwork;

function getUniqueTokens(wallets: WalletConfig[]): string[] {
  const tokens = wallets.reduce((acc, wallet) => {
    return wallet.tokens ? [...acc, ...wallet.tokens] : acc;
  }, [] as string[]);

  return [...new Set(tokens)];
}

export class EvmWalletToolbox extends WalletToolbox {
  private provider: EVMProvider;
  private chainConfig: EvmChainConfig;
  private tokenData: Record<string, EvmTokenData> = {};
  private options: EvmWalletOptions;
  private priceAssistant?: TokenPriceFeed;

  constructor(
    public network: string,
    public chainName: EVMChainName,
    public rawConfig: WalletConfig[],
    options: EvmWalletOptions,
    priceAssistant?: TokenPriceFeed
  ) {
    super(network, chainName, rawConfig, options);
    this.chainConfig = EVM_CHAIN_CONFIGS[this.chainName];

    const defaultOptions = this.chainConfig.defaultConfigs[this.network];

    this.options = { ...defaultOptions, ...options } as EvmWalletOptions;
    this.priceAssistant = priceAssistant;

    const nodeUrlOrigin = this.options.nodeUrl && new URL(this.options.nodeUrl).origin
    this.logger.debug(`EVM rpc url: ${nodeUrlOrigin}`);
    this.provider = new ethers.providers.JsonRpcProvider(this.options.nodeUrl);
  }

  protected validateChainName(chainName: string): chainName is EVMChainName {
    if (!(chainName in EVM_CHAIN_CONFIGS))
      throw new Error(`Invalid chain name "${chainName}" for EVM wallet`);
    return true;
  }

  protected validateNetwork(network: string): network is EvmNetworks {
    if (!(network in EVM_CHAIN_CONFIGS[this.chainName].networks))
      throw new Error(
        `Invalid network "${network}" for chain: ${this.chainName}`,
      );

    return true;
  }

  protected validateOptions(options: any): options is EvmWalletOptions {
    if (!options) return true;
    if (typeof options !== "object")
      throw new Error(`Invalid options for chain: ${this.chainName}`);
    return true;
  }

  protected validateTokenAddress(token: string): boolean {
    const knownTokens =
      EVM_CHAIN_CONFIGS[this.chainName].knownTokens[this.network];

    return (
      EVM_HEX_ADDRESS_REGEX.test(token) || token.toUpperCase() in knownTokens
    );
  }

  protected parseTokensConfig(
    tokens: string[],
    failOnInvalidTokens: boolean,
  ): string[] {
    const knownTokens =
      EVM_CHAIN_CONFIGS[this.chainName].knownTokens[this.network];

    const validTokens: string[] = [];
    for (const token of tokens) {
      if (EVM_HEX_ADDRESS_REGEX.test(token)) {
        validTokens.push(token);
      } else if (token.toUpperCase() in knownTokens) {
        validTokens.push(knownTokens[token.toUpperCase()]);
      } else {
        if (failOnInvalidTokens) {
          throw new Error(`Invalid token address or symbol: ${token}`);
        } else {
          this.logger.warn(`Invalid token address or symbol: ${token}`);
        }
      }
    }

    return validTokens;
  }

  protected async warmup() {
    const uniqueTokens = getUniqueTokens(Object.values(this.wallets));

    await mapConcurrent(
      uniqueTokens,
      async tokenAddress => {
        this.tokenData[tokenAddress] = await pullEvmTokenData(
          this.provider,
          tokenAddress,
        );
      },
      this.options.tokenPollConcurrency,
    );

    this.logger.debug(`EVM token data: ${JSON.stringify(this.tokenData)}`);
  }

  public async pullNativeBalance(address: string): Promise<WalletBalance> {
    const balance = await pullEvmNativeBalance(this.provider, address);
    const formattedBalance = ethers.utils.formatEther(balance.rawBalance);

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
    tokens: string[],
  ): Promise<TokenBalance[]> {
    return mapConcurrent(
      tokens,
      async tokenAddress => {
        const tokenData = this.tokenData[tokenAddress];
        const balance = await pullEvmTokenBalance(
          this.provider,
          tokenAddress,
          address,
        );
        const formattedBalance = ethers.utils.formatUnits(
          balance.rawBalance,
          tokenData.decimals,
        );

        const tokenPrice = this.priceAssistant?.getKey(tokenAddress);
        const tokenBalanceInUsd = tokenPrice ? BigInt(formattedBalance) * tokenPrice : undefined;

        return {
          ...balance,
          address,
          tokenAddress,
          formattedBalance,
          symbol: tokenData.symbol,
          usd: tokenBalanceInUsd,
        };
      },
      this.options.tokenPollConcurrency,
    );
  }

  protected async transferNativeBalance(
    privateKey: string,
    targetAddress: string,
    amount: number,
    maxGasPrice: number,
    gasLimit: number,
  ) {
    const txDetails = { targetAddress, amount, maxGasPrice, gasLimit };
    const receipt = await transferEvmNativeBalance(
      this.provider,
      privateKey,
      txDetails,
    );

    return receipt;
  }

  protected async getRawWallet (privateKey: string) {
    return new ethers.Wallet(privateKey, this.provider);
  }

  public async getGasPrice () {
    const gasPrice = await this.provider.getGasPrice();
    return BigInt(gasPrice.toString());
  }

  protected getAddressFromPrivateKey(privateKey: string): string {
    return getEvmAddressFromPrivateKey(privateKey);
  }
}
