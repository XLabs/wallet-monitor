import { WalletConfig, WalletToolbox, ChainName, KNOWN_CHAINS } from './base-wallet';
import { EvmWalletOptions, EvmNetworks, EvmWalletToolbox, EVM_CHAINS, EVMChainName } from './evm';
import { SolanaWalletOptions, SolanaWalletToolbox, SOLANA_CHAINS, SolanaChainName } from './solana';

export function isChain (chainName: string): chainName is ChainName {
  return chainName in KNOWN_CHAINS;
}

export function isEvmChain(chainName: ChainName): chainName is EVMChainName {
  return chainName in EVM_CHAINS;
}

export function isSolanaChain(chainName: ChainName): chainName is SolanaChainName {
  return chainName in SOLANA_CHAINS;
}

export function createWalletToolbox(network: string, chainName: string, wallets: WalletConfig[], walletOptions?: any): WalletToolbox {
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
