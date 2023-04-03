import { MultiWalletExporter } from 'wallet-monitor';

const options = {
  // Passing a logger is optional in case you want to see logs.
  logger: console,

  // Options for prometheus are passed inside the prometheus prop:
  prometheus: {
    // optional gaugeName. defaults to "wallet_monitor_balance"
    // gaugeName: 'wallet_monitor_balance',

    // optional registry. defaults to a new Registry()
    // registry: new Registry()
  }
};

const wallets = {
  // ethereum: {
  //   // optional, defaults to the main network of each chain
  //   // network: "goerli",

  //   // optional:
  //   // chainConfig: {
  //   //   The options available for chainconfig depend on the blockchain type you are monitoring (evm, solana, algo, etc...)
  //   //   the options for each type of chain are defined in wallets/<chain-type>/index.ts
  //   //   the all can share a basic set of options defined in wallets/base-wallet.ts
  //   //   
  //   //   you can see de defaults for each chain in src/wallets/<chain-type>/<chain-name>.config.ts
  //   //   for example: src/wallets/evm/ethereum.config.ts
  //   //
  //   //   The node url that will be used to instantiate the provider/connection/etc...
  //   //   nodeUrl: 'https://eth.llamarpc.com',
  //   // 
  //   //   the concurrency that will be used for polling tokens. defaults to 10.
  //   //   might be useful in the event of rate limiting. 
  //   //   tokenPollConcurrency: 1,
  //   // },
  //   addresses: {
  //     "0x80C67432656d59144cEFf962E8fAF8926599bCF8": ["USDC", "DAI"],
  //     "0x8d0d970225597085A59ADCcd7032113226C0419d": ["usdc"],
  //     "0xBd8eDBCad57b5197373309954DD959fCCa40d183": ["Usdc", "Dai"]
  //   },
  // },
  // polygon: {
  //   addresses: {
  //     "0x54403eC2C1035295E81172e1bf381d01Df135F67": ["USDC", "DAI"],
  //     "0x6b134F424D0CEFd7940f535FE89076341383fab8": ["usdc"],
  //     "0xAD2bF5dbDDE92D550cD3EC72CA1Ec3ddf2f107B8": [],
  //   },
  // },
  // solana: {
  //   addresses: {
  //     '6VnfVsLdLwNuuCmooLTziQ99PFXZ5vc3yyqyb9tMDhhw': ['usdc']
  //   }
  // }
}

const exporter = new MultiWalletExporter(wallets, options);

// Only one of the following is needed:

// This will pull the balances and you'll need to implement the metrics server manually
// exporter.start();

// This will pull balances and start a basic metrics server. port and path can be specified in the parameters
exporter.startMetricsServer();


exporter.getBalances() // returns all current balances

exporter.getRegistry() // returns the registry used by the prometheus client

exporter.metrics() // returns the metrics in prometheus format. syntax sugar over exporter.getRegistry().metrics()

exporter.on('balances', (chainName, network, newBalances, lastBalances) => {
  console.log(`Received new balances for chain: ${chainName}-${network}`);
  console.log("Balances updated:", newBalances);
  console.log("Previous balance:", lastBalances);

  console.log("All balances:", exporter.getBalances());
});

