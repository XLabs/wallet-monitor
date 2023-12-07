import { z } from "zod";

export const DEVNET = "devnet";

export const enum Environment {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  DEVNET = "devnet",
}

import {
  EvmWalletOptions,
  EvmWalletToolbox,
  EVM_CHAIN_CONFIGS,
  EVMChainName,
  EvmNetworks,
} from "./evm";
import {
  SOLANA_CHAIN_CONFIGS,
  SOLANA_CHAINS,
  SolanaChainName,
  SolanaWalletOptions,
  SolanaWalletToolbox,
} from "./solana";
import {
  SuiWalletToolbox,
  SUI_CHAINS,
  SuiChainName,
  SuiWalletOptions,
  SUI_CHAIN_CONFIGS,
} from "./sui";
import { SolanaNetworks } from "./solana/solana.config";
import { EvmChainConfig } from "./evm";
import { SuiChainConfig } from "./sui";
import { SolanaChainConfig } from "./solana";
import { PriceFeed } from "../wallet-manager";
import {
  COSMOS_CHAIN_CONFIGS,
  CosmosChainConfig,
  CosmosChainName,
  CosmosNetworks,
  CosmosWalletOptions,
  CosmosWalletToolbox,
} from "./cosmos";

export const KNOWN_CHAINS: Partial<{
  [key in ChainName]:
    | EvmChainConfig
    | SuiChainConfig
    | SolanaChainConfig
    | CosmosChainConfig;
}> = {
  ...SUI_CHAIN_CONFIGS,
  ...EVM_CHAIN_CONFIGS,
  ...SOLANA_CHAIN_CONFIGS,
  ...COSMOS_CHAIN_CONFIGS,
};

export type ChainName =
  | EVMChainName
  | SolanaChainName
  | SuiChainName
  | CosmosChainName;
export type Wallet =
  | EvmWalletToolbox
  | SolanaWalletToolbox
  | SuiWalletToolbox
  | CosmosWalletToolbox;
export type WalletOptions =
  | EvmWalletOptions
  | SolanaWalletOptions
  | SuiWalletOptions
  | CosmosWalletOptions;

// TODO: Consider writing a custom validator for an address?
export const WalletConfigSchema = z.object({
  address: z.string().optional(),
  tokens: z.array(z.string()).optional(),
  privateKey: z.string().optional(),
});
export type WalletConfig = z.infer<typeof WalletConfigSchema>;

export type Balance = {
  symbol: string;
  address: string;
  isNative: boolean;
  rawBalance: string;
  formattedBalance: string;
  blockHeight?: number;
  tokenUsdPrice?: number;
  balanceUsd?: number;
};

export type TokenBalance = Balance & {
  // TODO: put Solana mint address here and make this not optional
  // Otherwise handle this as a tagged union if there are other types of tokens there.
  tokenAddress?: string;
};

export type WalletBalance = Balance & {
  tokens: TokenBalance[];
};

export type AllNetworks = EvmNetworks | SolanaNetworks | CosmosNetworks;

export function isChain(chainName: string): chainName is ChainName {
  return chainName in KNOWN_CHAINS;
}

export function isEvmChain(chainName: ChainName): chainName is EVMChainName {
  return chainName in EVM_CHAIN_CONFIGS;
}

export function isSolanaChain(
  chainName: ChainName,
): chainName is SolanaChainName {
  return chainName in SOLANA_CHAINS;
}

export function isSuiChain(chainName: ChainName): chainName is SuiChainName {
  return chainName in SUI_CHAINS;
}

export function isCosmosChain(
  chainName: ChainName,
): chainName is CosmosChainName {
  return chainName in COSMOS_CHAIN_CONFIGS;
}

export function createWalletToolbox(
  network: string,
  chainName: string,
  wallets: WalletConfig[],
  walletOptions: WalletOptions,
  priceFeed?: PriceFeed,
): Wallet {
  if (!isChain(chainName)) throw new Error("Unknown chain name " + chainName);

  switch (true) {
    case isEvmChain(chainName):
      return new EvmWalletToolbox(
        network,
        chainName as EVMChainName,
        wallets,
        walletOptions,
        priceFeed,
      );

    case isSolanaChain(chainName):
      return new SolanaWalletToolbox(
        network,
        chainName as SolanaChainName,
        wallets,
        walletOptions,
        priceFeed,
      );

    case isSuiChain(chainName):
      return new SuiWalletToolbox(
        network,
        chainName as SuiChainName,
        wallets,
        walletOptions as SuiWalletOptions,
        priceFeed,
      );

    case isCosmosChain(chainName):
      return new CosmosWalletToolbox(
        network,
        chainName as CosmosChainName,
        wallets,
        walletOptions as CosmosWalletOptions,
        priceFeed,
      );
    default:
      throw new Error(`Unknown chain name ${chainName}`);
  }
}
