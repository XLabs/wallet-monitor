import { ethers } from 'ethers';
import { WalletConfig } from '.';
import { WalletToolbox } from './base-wallet';
import { Balance } from '../balances';

export type EvmWalletOptions = {
  nodeUrl: string;
}

export class EvmWalletToolbox extends WalletToolbox {
  // private provider: ethers.providers.JsonRpcProvider;

  public validateConfig(rawConfig: WalletConfig): void {

    
  }

  public parseTokensConfig(tokens: string[]): string[] {
    return ['0x0000000']
  }

  public async warmup() {

  }

  public async pull(): Promise<Balance[]> {
    return [];
  }
}