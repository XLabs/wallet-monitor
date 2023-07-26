export type {
  ILibraryWalletManager,
  IServiceWalletManager,
  IClientWalletManager,
} from "./i-wallet-manager";
export type { WalletManagerFullConfig } from "./wallet-manager";
export { buildWalletManager } from "./utils";

import { EVM_CHAIN_CONFIGS } from "./wallets/evm";
// import { SOLANA_CHAINS } from './wallets/solana';
import { WalletBalancesByAddress as WBBA } from "./chain-wallet-manager";

import { WalletInterface as WI } from "./wallets/base-wallet";
export type WalletBalancesByAddress = WBBA;
export type WalletInterface = WI;
export { MultiJsonRpcProvider } from "./providers/evm/MultiJsonRpcProvider";

/**
 * A map of chain names to their available networks.
 * It's exposed to the library user for convenience.
 * In most cases you can use the network name as you would expect it and it should work,
 * but this map contains available networks for each chain just in case you want to be 100% sure.
 */
export const NETWORKS = {
  [EVM_CHAIN_CONFIGS.ethereum.chainName]: EVM_CHAIN_CONFIGS.ethereum.networks,
  [EVM_CHAIN_CONFIGS.polygon.chainName]: EVM_CHAIN_CONFIGS.polygon.networks,
  [EVM_CHAIN_CONFIGS.avalanche.chainName]: EVM_CHAIN_CONFIGS.avalanche.networks,
};
