import { Balance } from '../balances';
import { WalletToolbox, WalletConfig } from './base-wallet';

export type TerraWalletOptions = {

};


export class TerraWalletToolbox extends WalletToolbox {
  private warm = false;
  constructor(public rawConfig: WalletConfig[]) {

  }

  public async pull(): Promise<Balance[]> {

  };
}