import { buildWalletManager, WalletManagerFullConfig } from "wallet-monitor";
import { wait } from "../test/utilities/common";
import { printError } from "../lib/utils";
import { rebalanceStrategies } from "../lib/rebalance-strategies";

// npx ganache -i 5777 \
//     --wallet.accounts=0xf9fdbcbcdb4c7c72642be9fe7c09ad5869a961a8ae3c3374841cb6ead5fd34b1,3000000000000000000 \
//     --wallet.accounts=0x5da88a1c7df3490d040792fcca4676e709fdd3e6f6e0142accc96cb7e205e1e0,2000000000000000000 \
//     --wallet.accounts=0xa2c984f6a752ee05af03dac0bb65f3ec93f1498d43d23ebe6c31cf988d771423,2000000000000000000 \

const allChainWallets: WalletManagerFullConfig["config"] = {
  ethereum: {
    chainConfig: {
      nodeUrl: "http://127.0.0.1:8545",
    },
    rebalance: {
      enabled: true,
      strategy: "pourOver",
      interval: 1000,
      minBalanceThreshold: 0.1,
    },
    wallets: [
      {
        privateKey:
          "0xf9fdbcbcdb4c7c72642be9fe7c09ad5869a961a8ae3c3374841cb6ead5fd34b1",
      },
      {
        privateKey:
          "0x5da88a1c7df3490d040792fcca4676e709fdd3e6f6e0142accc96cb7e205e1e0",
      },
      {
        privateKey:
          "0xa2c984f6a752ee05af03dac0bb65f3ec93f1498d43d23ebe6c31cf988d771423",
      },
    ],
    walletBalanceConfig: {
      enabled: false,
      scheduled: {
        enabled: false,
      },
    },
    priceFeedConfig: {
      supportedTokens: [
        {
          chainId: 2,
          chainName: "ethereum",
          tokenContract: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          coingeckoId: "usd-coin",
          symbol: "USDC",
        },
        {
          chainId: 2,
          chainName: "ethereum",
          tokenContract: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
          coingeckoId: "wrapped-bitcoin",
          symbol: "WBTC",
        },
      ],
    },
  },
};

export const manager = buildWalletManager({
  config: allChainWallets,
  options: {
    logLevel: "debug",
    balancePollInterval: 10000,
    failOnInvalidChain: false,
    failOnInvalidTokens: false,
    metrics: {
      enabled: true,
      serve: true,
      port: 9091,
    },
    priceFeedOptions: {
      enabled: true,
      scheduled: {
        enabled: false,
      },
    },
  },
});

async function main(){

    const timeout = 5000
    console.log(`Waiting ${timeout}ms for wallets to be ready...`)
    await wait(timeout)
    console.log("Done waiting")
for (let i = 0; i < 10; i++) {
  // perform an action with any wallet available in the pool:
  try {
    manager.withWallet("ethereum", async wallet => {
    // do what you need with the wallet
        wallet.walletToolbox.pullBalances()

      console.log({
        address: wallet.address,
        chainName: wallet.walletToolbox.chainName,
      });
      await wait(3000);
    });
  } catch (e) {
    console.log(printError(e));
  }
}
}

main()
