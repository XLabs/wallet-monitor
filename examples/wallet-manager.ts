import { WalletManager } from 'wallet-monitor';

const options = {
  logger: console,
  balancePollInterval: 10000,
  metrics: {
    enabled: true,
    serve: true,
    // port: 9091,
    // path: '/metrics',
    // registry: new Registry()
  }
};


const allChainWallets = {
  ethereum: {
    // network: "goerli",
    // chainConfig: {
    //   nodeUrl: 'https://eth.llamarpc.com',
    //   tokenPollConcurrency: 1,
    // },
    // rebalance: {},
    wallets: [
      {
        address: "0x80C67432656d59144cEFf962E8fAF8926599bCF8",
        tokens: ["USDC", "DAI"]
      },
      {
        address: "0x8d0d970225597085A59ADCcd7032113226C0419d",
        tokens: ["usdc"]
      }
    ]
  }
}

const exporter = new WalletManager(allChainWallets, options);

// Only one of the following is needed:

// This will pull the balances and you'll need to implement the metrics server manually
// exporter.start();

// This will pull balances and start a basic metrics server. port and path can be specified in the parameters

exporter.getRegistry() // returns the registry used by the prometheus client

exporter.metrics() // returns the metrics in prometheus format. syntax sugar over exporter.getRegistry().metrics()

exporter.on('balances', (chainName, network, newBalances, lastBalances) => {
  console.log(`Received new balances for chain: ${chainName}-${network}`);
  console.log("Balances updated:", newBalances);
  console.log("Previous balance:", lastBalances);

  console.log("All balances:", exporter.getBalances());
});

