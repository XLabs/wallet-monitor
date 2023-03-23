export type SolanaWalletOptions = {

};


export const SOLANA_CHAINS = {
  solana: { nativeCurrencySymbol: 'SOL' },
  pythnet: { nativeCurrencySymbol: 'PYTH' },
};


export type SolanaChainName = keyof typeof SOLANA_CHAINS;

export class SolanaWalletToolbox {
//   constructor(public rawConfig: WalletConfig[]) {

//   }

//   public async pull(): Promise<Balance[]> {

//   };
}