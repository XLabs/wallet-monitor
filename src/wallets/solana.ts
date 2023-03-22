import { isEvmChain, EvmChainNames, isSolanaChain, EvmChainIds, chainNameToWormholeId, KnownChainNames, KnownChainIds } from '../wallets/wormhole-related-utils';

export type SolanaWalletOptions = {

};


export class SolanaWalletToolbox extends WalletToolbox {
  constructor(public rawConfig: WalletConfig[]) {

  }

  public async pull(): Promise<Balance[]> {

  };
}