import { isEvmChain, isTerraChain, isSolanaChain, isChain, EVMChainName } from './chains';

import { WalletToolbox } from './base-wallet';
import { EvmWalletOptions, EvmWalletToolbox } from './evm';
import { 
  SolanaWalletOptions,
  // SolanaWalletToolbox
} from './solana';
import {
  TerraWalletOptions,
  // TerraWalletToolbox
} from './terra';

export { WalletToolbox } from './base-wallet';

export type WalletOptions = EvmWalletOptions | SolanaWalletOptions | TerraWalletOptions;

export type WalletConfig = {
  address: string;
  tokens: string[];
  options?: WalletOptions;
}

export function createWalletToolbox(network: string, chainName: string, wallets: WalletConfig[], walletOptions?: WalletOptions): WalletToolbox {
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

    // case isTerraChain(chainName):
    //   return new TerraWalletToolbox(network, chainName, wallets);

    default:
      throw new Error(`Unknown chain name ${chainName}`);
  }
}
