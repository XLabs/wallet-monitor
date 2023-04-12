
export { WalletWatcher } from './wallet-watcher';
export { WalletExporter } from './wallet-exporter';
export { MultiWalletWatcher } from './multi-wallet-watcher';
export { MultiWalletExporter } from './multi-wallet-exporter';

import { EVM_CHAIN_CONFIGS  } from './wallets/evm';
// import { SOLANA_CHAINS } from './wallets/solana';

import { MultiWalletWatcherConfig as MWWConfig } from './multi-wallet-watcher';
import { MultiWalletExporterOptions as MWEOptions } from './multi-wallet-exporter';

export type MultiWalletExporterOptions = MWEOptions;
export type MultiWalletWatcherConfig = MWWConfig;

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

