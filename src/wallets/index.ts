import { EvmWalletOptions, EvmWalletToolbox, EVM_CHAIN_CONFIGS, EVMChainName, EvmNetworks } from './evm';
// import { SolanaWalletOptions, SolanaWalletToolbox, SOLANA_CHAINS, SolanaChainName } from './solana';


export const KNOWN_CHAINS = {
  ...EVM_CHAIN_CONFIGS,
  // ...SOLANA_CHAINS,
}

export type ChainName = EVMChainName // | SolanaChainName;
export type Wallet = EvmWalletToolbox // | SolanaWalletToolbox;
export type WalletOptions = EvmWalletOptions // | SolanaWalletOptions;

export type WalletConfig = {
  address: string;
  tokens: string[];
}

export type WalletBalance = {
  address: string,
  isNative: boolean;
  currencyName: string;
  balanceAbsolute: string;
  balanceFormatted: string;
  // only if isNative = false.
  currencyNativeAddres?: string;
}

type AllNetworks = EvmNetworks // | SolanaNetworks

export function isChain (chainName: string): chainName is ChainName {
  return chainName in KNOWN_CHAINS;
}

export function isEvmChain(chainName: ChainName): chainName is EVMChainName {
  return chainName in EVM_CHAIN_CONFIGS;
}

// export function isSolanaChain(chainName: ChainName): chainName is SolanaChainName {
//   return chainName in SOLANA_CHAINS;
// }

export function createWalletToolbox(
  network: string, chainName: string, wallets: WalletConfig[], walletOptions?: WalletOptions
): Wallet {
  if (!isChain(chainName)) throw new Error('Unknown chain name ' + chainName);

  switch (true) {
    case isEvmChain(chainName):
      return new EvmWalletToolbox(
        network,
        chainName as EVMChainName,
        wallets,
        walletOptions);

    // case isSolanaChain(chainName):
    //   return new SolanaWalletToolbox(network, chainName, wallets);

    default:
      throw new Error(`Unknown chain name ${chainName}`);
  }
}
