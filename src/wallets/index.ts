import { ethers } from 'ethers';
import { isEvmChain, EvmChainNames, isSolanaChain, EvmChainIds, chainNameToWormholeId } from '../wallets/wormhole-related-utils';

import { Balance } from '../balances';

import { constants } from './consts';

export type WalletOptions = EvmWalletOptions | SolanaWalletOptions | TerraWalletOptions;

export type EvmWalletOptions = {
  nodeUrl: string;
}

export type SolanaWalletOptions = {
};

export type TerraWalletOptions = {
};

export type WalletConfig = {
  address: string;
  tokens: string[];
  options?: WalletOptions;
}


export abstract class WalletToolbox {
  // raw config received from the user
  abstract rawConfig: WalletConfig[];
  abstract wormholeChainId: number;

  // instantiate provider for the chain
  // calculate data which could be re-utilized (for example token's local addresses, symbol and decimals in evm chains)
  abstract warmup: () => Promise<void>;
  
  // get balances for the given address and tokens
  abstract pullBalances(): Promise<Balance[]>;
}


export class EvmWalletToolbox implements WalletToolbox {
  private warm = false;
  private wormholeChainId: EvmChainIds;
  private provider: ethers.providers.JsonRpcProvider;

  constructor(chainName: EvmChainNames,public rawConfig: WalletConfig[], options: WalletOptions) {
    this.wormholeChainId = chainNameToWormholeId(chainName);

    this.provider = new ethers.providers.JsonRpcProvider();
  }
  
  public async pullBalances(): Promise<Balance[]> {
    if (!this.warm) await this.warmup();



  }

  public async warmup() {

    // instantiate provider for the chain
    // calculate data which could be re-utilized (for example symbol and decimals in evm chains)
    this.warm = true;
  }
}

export class SolanaWalletToolbox implements WalletToolbox {
  private warm = false;
  constructor(public rawConfig: WalletConfig[]) {

  }
  
  public async pullBalances(): Promise<Balance[]> {
    if (!this.warm) await this.warmup(); 

  };

  async warmup() {


    this.warm = true;
  }
}

export class TerraWalletToolbox implements WalletToolbox {
  private warm = false;
  constructor(public rawConfig: WalletConfig[]) {

  }

  public async pullBalances(): Promise<Balance[]> {
    if (!this.warm) await this.warmup(); 

  };

  async warmup() {
    this.warm = true;
  }
}

export function createWalletToolbox(network: string, chainName: string, wallets: WalletConfig[]): WalletToolbox {
  switch (true) {
    case isEvmChain(chainName):
      return new EvmWalletToolbox(chainName as EvmChainNames, wallets);

    case isSolanaChain(chainName):
      return new SolanaWalletToolbox(config);
    default:
      throw new Error(`Unknown chain name ${chainName}`);
  }
}
