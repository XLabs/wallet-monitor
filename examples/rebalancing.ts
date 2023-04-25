import { WalletManager, WalletBalancesByAddress, WalletManagerOptions, WalletManagerConfig, WalletInterface } from 'wallet-monitor';

// npx ganache -i 5777 \
//     --wallet.accounts=0xf9fdbcbcdb4c7c72642be9fe7c09ad5869a961a8ae3c3374841cb6ead5fd34b1,200000000000000000 \
//     --wallet.accounts=0x5da88a1c7df3490d040792fcca4676e709fdd3e6f6e0142accc96cb7e205e1e0,200000000000000000 \
//     --wallet.accounts=0xa2c984f6a752ee05af03dac0bb65f3ec93f1498d43d23ebe6c31cf988d771423,200000000000000000 \
//     --wallet.accounts=0xe0c1c809d0e80dcaaf200b3aec2a91cd00ed05134f10026113219d89d2f6a9b2,200000000000000000 \
//     --wallet.accounts=0x3500084e268b862df23a229f268510cdee92623102c4786b0ade6203fa59f421,200000000000000000 \
//     --wallet.accounts=0x49692cfecfb48cee7ce8a14273bda6996b832149ff7260bca09c2ea159e9147f,200000000000000000 \
//     --wallet.accounts=0xb2868bd9090dcfbc9d6f3012c98039ee20d778f8ef2d8cb721c56b69578934f3,200000000000000000 \
//     --wallet.accounts=0x50156cc51cb7ae4f5e6e2cb14a75fc177a1917fbab1a8675db25619567515ddd,200000000000000000 \
//     --wallet.accounts=0x6790f27fec85575792c7d1fab8de9955aff171b24329eacf2a279defa596c5d3,200000000000000000 \
//     --wallet.accounts=0xe94000d730b9655850afc8e39facb7058678f11e765075d4806d27ed619f258c,20000000000000000000


const options: WalletManagerOptions = {
  // logger: console,
  balancePollInterval: 10000,
  metrics: {
    enabled: true,
    serve: true,
    port: 9091,
  }
};

const allChainWallets: WalletManagerConfig = {
  ethereum: {
    chainConfig: {
      nodeUrl: "http://localhost:8545",
    },
    rebalance: {
      enabled: true,
      strategy: 'pourOver',
      interval: 10000,
      minBalanceThreshold: 0.3,
      // maxGasPrice: 100000000000,
      // maxGasLimit: 1000000,
    },
    wallets: [
      { address: "0xFa6E597ca1c7E72838c850d1268dDf618D444712", privateKey: '0xf9fdbcbcdb4c7c72642be9fe7c09ad5869a961a8ae3c3374841cb6ead5fd34b1' },
      { address: "0x084955aC084cBa93C8fccd997916b942DD3169B0", privateKey: '0x5da88a1c7df3490d040792fcca4676e709fdd3e6f6e0142accc96cb7e205e1e0' },
      { address: "0x52E636aAC22CfDF8f79bBb9e9B4B87824cB532Ae", privateKey: '0xa2c984f6a752ee05af03dac0bb65f3ec93f1498d43d23ebe6c31cf988d771423' },
      { address: "0x4d41A26fd00BB04564E04a16620a6B772D6aEdec", privateKey: '0xe0c1c809d0e80dcaaf200b3aec2a91cd00ed05134f10026113219d89d2f6a9b2' },
      { address: "0x5d075F411a533d9134Fa5d4EBE0418584813B2a5", privateKey: '0x3500084e268b862df23a229f268510cdee92623102c4786b0ade6203fa59f421' },
      { address: "0x77a987b709dC03297cb4f2835C130C477836760b", privateKey: '0x49692cfecfb48cee7ce8a14273bda6996b832149ff7260bca09c2ea159e9147f' },
      { address: "0x12188a7270497b9f80Fe3CAB2eAf280F24b85066", privateKey: '0xb2868bd9090dcfbc9d6f3012c98039ee20d778f8ef2d8cb721c56b69578934f3' },
      { address: "0x801c5eA9B1A1bD287F487b516c0CAADe06AF10f1", privateKey: '0x50156cc51cb7ae4f5e6e2cb14a75fc177a1917fbab1a8675db25619567515ddd' },
      { address: "0xEc18A727a11A65b71De926c7f5f39c56f42641E0", privateKey: '0x6790f27fec85575792c7d1fab8de9955aff171b24329eacf2a279defa596c5d3' },
      { address: "0x0EaC31cB932229D0Dcc628f89894012b7827481c", privateKey: '0xe94000d730b9655850afc8e39facb7058678f11e765075d4806d27ed619f258c' },
    ]
  }
}


export const manager = new WalletManager(allChainWallets, options);
