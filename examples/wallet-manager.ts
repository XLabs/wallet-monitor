import { ILocalWalletManager, WalletManager, WalletBalancesByAddress, WalletManagerOptions, WalletManagerConfig, WalletInterface } from 'wallet-monitor';
import {buildWalletManager} from "../src";

const options: WalletManagerOptions = {
  logLevel: 'debug',
  balancePollInterval: 10000,
  metrics: {
    enabled: true,
    serve: true,
    port: 9091,
  }
};

const allChainWallets: WalletManagerConfig = {
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
        tokens: ["USDC", "DAI"]
      },
      {
        address: "0x8d0d970225597085A59ADCcd7032113226C0419d",
        tokens: []
      }
    ]
  },
  solana: {
    wallets: [
      { address: "6VnfVsLdLwNuuCmooLTziQ99PFXZ5vc3yyqyb9tMDhhw", tokens: ['usdc'] },
    ],
  }
}

// export const manager: ILocalWalletManager = new WalletManager(allChainWallets, options);
export const manager = buildWalletManager('local', allChainWallets, options)

// if metrics.enabled=true, metrics.serve=false, you can use:
manager.getRegistry();
manager.metrics();


manager.on('balances', (chainName, network, newBalances, lastBalances) => {
  console.log(`Received new balances for chain: ${chainName}-${network}`);
  // console.log("Balances updated:", newBalances);
  // console.log("Previous balance:", lastBalances);

  console.log("All Balances:", JSON.stringify(manager.getAllBalances()));
  // console.log("Ethereum Balances:", manager.getChainBalances('ethereum'));
});

const allBalances: Record<string, WalletBalancesByAddress> = manager.getAllBalances();

const ethereumBalances: WalletBalancesByAddress = manager.getChainBalances('ethereum');

// perform an action with any wallet available in the pool:
const doSomethingWithWallet = async (wallet: WalletInterface) => {
  // do what you need with the wallet
  // console.log(
    // wallet.provider,
    // wallet.address,
    // wallet.privateKey,
  // );
};

// perform an action with any wallet available in the pool:
manager.withWallet('ethereum', doSomethingWithWallet);

// perform an action with one particular wallet:
manager.withWallet('ethereum', doSomethingWithWallet, {
  address: '0x80C67432656d59144cEFf962E8fAF8926599bCF8',
});

// configure the timeout for acquiring the wallet to use:
manager.withWallet('ethereum', doSomethingWithWallet, {
  leaseTimeout: 10_000,
});
