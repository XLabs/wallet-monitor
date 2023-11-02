import { buildWalletManager, WalletManagerFullConfig } from 'wallet-monitor';

const allChainWallets: WalletManagerFullConfig['config'] = {
  ethereum: {
    rebalance: {
      enabled: false,
      strategy: 'default',
      interval: 10000,
      minBalanceThreshold: 0.1,
    },
    wallets: [
      {
        address: "0x80C67432656d59144cEFf962E8fAF8926599bCF8",
        tokens: ["USDC"]
      },
      {
        address: "0x8d0d970225597085A59ADCcd7032113226C0419d",
        tokens: ["WBTC"]
      }
    ],
    priceFeedConfig: {
      supportedTokens: [{
        chainId: 2,
        tokenContract: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        coingeckoId: "usd-coin",
        symbol: "USDC"
      },
      {
        chainId: 2,
        tokenContract: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        coingeckoId: "wrapped-bitcoin",
        symbol: "WBTC"
      }],
      enabled: true,
      scheduled: {
        enabled: false
      },
    }
  },
  solana: {
    wallets: [
      { address: "6VnfVsLdLwNuuCmooLTziQ99PFXZ5vc3yyqyb9tMDhhw", tokens: ['usdc'] },
    ],
  },
  sui: {
    rebalance: {
      enabled: false,
      strategy: 'default',
      interval: 10000,
      minBalanceThreshold: 0.1,
    },
    wallets: [
      { privateKey: 'ODV9VYi3eSljEWWmpWh8s9m/P2BNNxU/Vp8jwADeNuw=' },
      { address: '0x934042d46762fadf9f61ef07aa265fc14d28525c7051224a5f1cba2409aef307' },
      { address: '0x341ab296bbe653b426e996b17af33718db62af3c250c04fe186c9124db5bd8b7' },
      { address: '0x7d20dcdb2bca4f508ea9613994683eb4e76e9c4ed371169677c1be02aaf0b58e' },
      { address: '0x18337b4c5b964b7645506542589c5ed496e794af82f98b3789fed96f61a94c96' },
      { address: '0x9ae846f88db3476d7c9f2d8fc49722f7085a3b46aad998120dd11ebeab83e021' },
      { address: '0xcb39d897bf0561af7531d37db9781e54528269fed4761275931ce32f20352977' },
      { 
        address: '0x8f11fe7121be742f46e2b3bc2eba081efdc3027697c317a917a2d16fd9b59ab1', 
        tokens: ['USDC', 'USDT'] 
      },
    ],
    priceFeedConfig: {
      supportedTokens: [{
        chainId: 21,
        tokenContract: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf",
        coingeckoId: "usd-coin",
        symbol: "USDC"
      }],
      enabled: true,
      scheduled: {
        enabled: false
      },
    }
  },
  klatyn: {
    rebalance: {
      enabled: false,
      strategy: 'default',
      interval: 10000,
      minBalanceThreshold: 0.1,
    },
    wallets: [
      {
        address: "0x80C67432656d59144cEFf962E8fAF8926599bCF8",
        tokens: ["USDC", "DAI"]
      },
      {
        address: "0x8d0d970225597085A59ADCcd7032113226C0419d",
        tokens: []
      }
    ]
  }
}

export const manager = buildWalletManager({
  config: allChainWallets,
  options: {
    logLevel: 'debug',
    balancePollInterval: 10000,
    failOnInvalidChain: false,
    failOnInvalidTokens: false,
    metrics: {
      enabled: true,
      serve: true,
      port: 9091,
    }
  }
});


// Note: Below code needs wallet's private key to be set in config abopve for aquiring wallet
// manager.withWallet('ethereum', async (wallet) => {
//   console.log('Address', wallet.address);
//   console.log('Block height', wallet.walletToolbox.getBlockHeight());
//   console.log('Native balances', await wallet.walletToolbox.pullNativeBalance(wallet.address));
//   console.log('Token balances', await wallet.walletToolbox.pullTokenBalances(wallet.address, ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599']));
// })
