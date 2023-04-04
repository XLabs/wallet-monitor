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
  ethereum: {
    // optional, defaults to the main network of each chain
    // network: "goerli",

    // optional:
    // chainConfig: {
    //   The options available for chainconfig depend on the blockchain type you are monitoring (evm, solana, algo, etc...)
    //   the options for each type of chain are defined in wallets/<chain-type>/index.ts
    //   the all can share a basic set of options defined in wallets/base-wallet.ts
    //   
    //   you can see de defaults for each chain in src/wallets/<chain-type>/<chain-name>.config.ts
    //   for example: src/wallets/evm/ethereum.config.ts
    //
    //   The node url that will be used to instantiate the provider/connection/etc...
    //   nodeUrl: 'https://eth.llamarpc.com',
    // 
    //   the concurrency that will be used for polling tokens. defaults to 10.
    //   might be useful in the event of rate limiting. 
    //   tokenPollConcurrency: 1,
    // },
    addresses: {
      "0x80C67432656d59144cEFf962E8fAF8926599bCF8": ["USDC", "DAI"],
      "0x8d0d970225597085A59ADCcd7032113226C0419d": ["usdc"],
      "0xBd8eDBCad57b5197373309954DD959fCCa40d183": ["Usdc", "Dai"]
    },
  },
  polygon: {
    addresses: {
      "0x54403eC2C1035295E81172e1bf381d01Df135F67": ["USDC", "DAI"],
      "0x6b134F424D0CEFd7940f535FE89076341383fab8": ["usdc"],
      "0xAD2bF5dbDDE92D550cD3EC72CA1Ec3ddf2f107B8": [],
    },
  },
  solana: {
    addresses: {
      '6VnfVsLdLwNuuCmooLTziQ99PFXZ5vc3yyqyb9tMDhhw': ['usdc']
    }
  },
  bsc: {
    addresses: {
      '0x00E2a641B4206Ce108FAa820e7A0ED5ee6f7e1e3': ['usdc', 'DAI'],
      '0xc391A88165d9E23eBD28c2e220c5f9900D1D8f35': ['usdc'],
      '0x2DFEb752222ccceCB9BC0a934b02C3A86f633900': [],
    },
  },
  fantom: {
    addresses: {
      '0x7Eef5c40b1b6C4440D41d3731E7dfcF29FfdDe31': ['DAI'],
      '0x5780E20C542F002c3E8d59160B637D18d2088660': ['usdc'],
      '0x7bb73a503d6B2Cb23DD44C71d197c2e43B295043': [],
    },
  },
  celo: {
    addresses: {
      '0x7119CD89D4792aF90277d84cDffa3F2Ab22a0022': [],
      '0x0DCC5B5eb6624C5a1857566cd6E854E95FFb0C0b': [],
      '0xcC18de11118C70281032c11Bbb984A6DE0c97cd7': [],
    }
  },
  moonbeam: {
    addresses: {
      '0x76f5588D3eF1E41197ab9895E12b5a6Cf93d6F89': ['DAI'],
      '0xC106C836771B0B4f4a0612Bd68163Ca93be1D340': ['usdc'],
      '0xaE21867e103AA22D0790ABf980277e9215B053f9': [],
    }
  }
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

