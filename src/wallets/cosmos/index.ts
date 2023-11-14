import { TokenBalance, WalletBalance, WalletConfig } from "..";
import { Wallets } from "../../chain-wallet-manager";
import { PriceFeed } from "../../wallet-manager";
import {
  BaseWalletOptions,
  TransferRecepit,
  WalletToolbox,
} from "../base-wallet";
import {
  OSMOSIS,
  OSMOSIS_CHAIN_CONFIG,
  OsmosisNetwork,
} from "./osmosis.config";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import {
  createSigner,
  getCosmosAddressFromPrivateKey,
  pullCosmosNativeBalance,
  transferCosmosNativeBalance,
} from "../../balances/cosmos";
import { ethers } from "ethers";

export type CosmosChainConfig = {
  chainName: string;
  networks: Record<string, number>;
  knownTokens: Record<string, Record<string, string>>;
  defaultConfigs: Record<string, CosmosDefaultConfig>;
  nativeCurrencySymbol: string;
  defaultNetwork: string;
};

const COSMOS_CHAINS = {
  [OSMOSIS]: 1,
};

export type CosmosDefaultConfig = {
  nodeUrl: string;
  tokenPollConcurrency?: number;
  nativeDenom: string;
  addressPrefix: string;
  defaultDecimals: number;
};

export type CosmosDefaultConfigs = Record<string, CosmosDefaultConfig>;
export type CosmosChainName = keyof typeof COSMOS_CHAINS;
export type CosmosWallet = SigningStargateClient;
export type CosmosProvider = StargateClient;

export const COSMOS_CHAIN_CONFIGS: Record<CosmosChainName, CosmosChainConfig> =
  {
    [OSMOSIS]: OSMOSIS_CHAIN_CONFIG,
  };

export type CosmosWalletOptions = BaseWalletOptions & {
  nodeUrl?: string;
  tokenPollConcurrency?: number;
  nativeDenom: string;
  addressPrefix: string;
  defaultDecimals: number;
};

export type CosmosNetworks = OsmosisNetwork;

export class CosmosWalletToolbox extends WalletToolbox {
  private provider: CosmosProvider | null;
  private chainConfig: CosmosChainConfig;

  constructor(
    public network: string,
    public chainName: string,
    public rawConfig: WalletConfig[],
    private options: CosmosWalletOptions,
    private priceFeed?: PriceFeed,
  ) {
    // Need to do all this before calling `super` because some options are needed
    // when the parent class calls `buildWalletConfig`.
    // The bad thing about all this is that now configuration is duplicated. In one
    // hand we will have the chainConfig which later is associated to `this.chainConfig`
    // but it is not available when the parent class is instantiated. And on the other
    // hand we are forced to pass the same options to the parent class, for some abstract
    // functions that are implemented in this class but are called from the parent class.
    // Specifically for the Cosmos ecosystem, the `addressPrefix` is needed to derive
    // and address based on a private key. Other options might be needed in the future.
    // So, for now, we will have to live with duplicated options.
    // TODO: Refactor wallet initialization
    const chainConfig = COSMOS_CHAIN_CONFIGS[chainName as CosmosChainName];
    const defaultOptions = chainConfig.defaultConfigs[network];
    options.addressPrefix = defaultOptions.addressPrefix;
    options.defaultDecimals = defaultOptions.defaultDecimals;
    options.nativeDenom = defaultOptions.nativeDenom;

    super(network, chainName, rawConfig, options);
    this.chainConfig = chainConfig;

    this.options = { ...defaultOptions, ...options } as CosmosWalletOptions;
    this.priceFeed = priceFeed;
    this.provider = null;
  }

  protected validateChainName(chainName: string): chainName is CosmosChainName {
    if (!(chainName in COSMOS_CHAIN_CONFIGS)) {
      throw new Error(`Invalid chain name "${chainName}" form Cosmos wallet`);
    }

    return true;
  }

  protected validateNetwork(network: string): network is CosmosNetworks {
    if (
      !(
        network in
        COSMOS_CHAIN_CONFIGS[this.chainName as CosmosChainName].networks
      )
    ) {
      throw new Error(
        `Invalid network "${network}" for chain: ${this.chainName}`,
      );
    }

    return true;
  }

  protected validateOptions(options: any): options is CosmosWalletOptions {
    if (!options) return true;
    if (typeof options !== "object") {
      throw new Error(`Invalid options for chain "${this.chainName}"`);
    }

    return true;
  }

  protected validateTokenAddress(token: string): boolean {
    return true;
  }

  protected parseTokensConfig(
    tokens: string[],
    failOnInvalidTokens: boolean,
  ): string[] {
    return [];
  }

  protected async warmup() {
    this.provider = await StargateClient.connect(this.options.nodeUrl!);
  }

  public async pullNativeBalance(address: string): Promise<WalletBalance> {
    const { nativeDenom, defaultDecimals } =
      this.chainConfig.defaultConfigs[this.network];
    const balance = await pullCosmosNativeBalance(
      this.provider!,
      address,
      nativeDenom,
    );

    return {
      ...balance,
      symbol: this.chainConfig.nativeCurrencySymbol,
      address,
      formattedBalance: ethers.utils.formatUnits(
        balance.rawBalance,
        defaultDecimals,
      ),
      tokens: [],
    };
  }

  public async pullTokenBalances(
    address: string,
    tokens: string[],
  ): Promise<TokenBalance[]> {
    return [];
  }

  protected async transferNativeBalance(
    privateKey: string,
    targetAddress: string,
    amount: number,
    maxGasPrice?: number | undefined,
    gasLimit?: number | undefined,
  ): Promise<TransferRecepit> {
    const { addressPrefix, defaultDecimals, nativeDenom } =
      this.chainConfig.defaultConfigs[this.network];
    const nodeUrl = this.options.nodeUrl!;
    const txDetails = {
      targetAddress,
      amount,
      addressPrefix,
      defaultDecimals,
      nativeDenom,
      nodeUrl,
    };
    const receipt = await transferCosmosNativeBalance(privateKey, txDetails);

    return receipt;
  }

  protected async getRawWallet(privateKey: string): Promise<Wallets> {
    const { addressPrefix } = this.chainConfig.defaultConfigs[this.network];
    const signer = await createSigner(privateKey, addressPrefix);

    return await SigningStargateClient.connectWithSigner(
      this.options.nodeUrl!,
      signer,
    );
  }

  public async getGasPrice(): Promise<bigint> {
    return Promise.resolve(0n);
  }

  public async getBlockHeight(): Promise<number> {
    return this.provider?.getHeight() || 0;
  }

  protected getAddressFromPrivateKey(
    privateKey: string,
    options?: CosmosWalletOptions,
  ): string {
    const { addressPrefix } = options!;
    return getCosmosAddressFromPrivateKey(privateKey, addressPrefix);
  }
}
