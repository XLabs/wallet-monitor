import { ethers } from 'ethers';
import { WalletToolbox, WalletConfig } from './base-wallet';

import { EvmChainNames } from '../wallets/wormhole-related-utils';

export type EvmWalletOptions = {
  nodeUrl: string;
}


export class EvmWalletToolbox extends WalletToolbox {
  public validateConfig(rawConfig: WalletConfig[]): void {
    
  }
  
  public async parseAddressConfig(address: string): string {
    
  }

  public async parseTokensConfig(tokens: string[]): string[] {

  }
  public async pull(): Promise<Balance[]> {

  }
}