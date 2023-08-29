import { WalletManagerOptions, WalletManagerConfig } from 'wallet-monitor';
import {buildWalletManager} from "../src";

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
//     --wallet.accounts=0xe94000d730b9655850afc8e39facb7058678f11e765075d4806d27ed619f258c,10000000000000000000


const options: WalletManagerOptions = {
  logLevel: 'debug',
  balancePollInterval: 5000,
  metrics: {
    enabled: true,
    serve: true,
    port: 9091,
  },
  failOnInvalidChain: true
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
      maxGasPrice: 10000,
      gasLimit: 1000000,
    },
    wallets: [
      { privateKey: '0xf9fdbcbcdb4c7c72642be9fe7c09ad5869a961a8ae3c3374841cb6ead5fd34b1' },
      { privateKey: '0x5da88a1c7df3490d040792fcca4676e709fdd3e6f6e0142accc96cb7e205e1e0' },
      { privateKey: '0xa2c984f6a752ee05af03dac0bb65f3ec93f1498d43d23ebe6c31cf988d771423' },
      { privateKey: '0xe0c1c809d0e80dcaaf200b3aec2a91cd00ed05134f10026113219d89d2f6a9b2' },
      { privateKey: '0x3500084e268b862df23a229f268510cdee92623102c4786b0ade6203fa59f421' },
      { privateKey: '0x49692cfecfb48cee7ce8a14273bda6996b832149ff7260bca09c2ea159e9147f' },
      { privateKey: '0xb2868bd9090dcfbc9d6f3012c98039ee20d778f8ef2d8cb721c56b69578934f3' },
      { privateKey: '0x50156cc51cb7ae4f5e6e2cb14a75fc177a1917fbab1a8675db25619567515ddd' },
      { privateKey: '0x6790f27fec85575792c7d1fab8de9955aff171b24329eacf2a279defa596c5d3' },
      { privateKey: '0xe94000d730b9655850afc8e39facb7058678f11e765075d4806d27ed619f258c' },
    ]
  },

}


export const manager = buildWalletManager({config: allChainWallets, options})
