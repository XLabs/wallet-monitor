import { WalletWatcher } from 'wallet-monitor';

// If some configuration is not correct, WalletMonitor will throw an error inmediately, even if it
// wasn't started yet. If the monitor was instantiated correctly, you can be sure that it has all 
// necessary configuration to run, including valid addresses and tokens.
const monitor = new WalletWatcher({
  network: 'mainnet',
  chainName: 'ethereum',
  // cooldown is optional. Defaults to 60 seconds.
  // sets the time between each polling run
  // cooldown: 100* 15,

  // logger is optional. You can pass a logger if you are interested in getting logs from the monitor
  logger: console,

  // Wallet options are optional.
  // The options available depend on the blockchain type you are monitoring (evm, solana, algo, etc...)
  // the options for each type of chain are defined in wallets/<chain-type>/index.ts
  // the all can share a basic set of options defined in wallets/base-wallet.ts
  walletOptions: {
    // nodeUrl: 'https://eth.llamarpc.com',
    // tokenPollConcurrency: 1,
  },
}, [
  {
    // This is the public native address of the wallet you want to monitor
    // the native balance for this wallet will be pulled
    address: '0x80C67432656d59144cEFf962E8fAF8926599bCF8',

    // the tokens parameter accepts a list of tokens to pull balances for.
    // the balances of these tokens will be pulled for the wallet above.
    // you can see the supported tokens for each chain in the config for
    // the chain. For example for ethereum: wallets/evm/ethereum.config.ts
    tokens: ['USDC', 'DAI']
  },
  {
    address: '0x8d0d970225597085A59ADCcd7032113226C0419d',

    // for tokens not supported you can add the token address instead:
    tokens: ['usdc']
  },
  {
    address: '0xBd8eDBCad57b5197373309954DD959fCCa40d183',
    
    // the token names are case insensitive
    tokens: ['Usdc', 'Dai']
  }
]);

// This event will be called each time balances are received for the wallets
monitor.on('balances', (balances) => {
  // Do what you need with your balances
  console.log("Received Balances:", balances);
});

// This event will be called in case an error arrises in the polling process
// The monitor will automatically poll again after "cooldown" time
monitor.on('error', (error) => {
  console.error("Error:", error);
});

// A polling run was skipped because the previous one was still running
monitor.on('skipped', (skipped) => { 
  console.warn(skipped);
});


monitor.start();
