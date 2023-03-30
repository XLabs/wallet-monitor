import { MultiWalletWatcher } from 'wallet-monitor';

const options = {
 // options are exactly the same as in WalletWatcher
};

const watcher = new MultiWalletWatcher({
  ethereum: {
    // optional, defaults to the main network of each chain
    // network: "goerli",

    // optional:
    // chainConfig: {
    //   The options available for chainconfig depend on the blockchain type you are monitoring (evm, solana, algo, etc...)
    //   the options for each type of chain are defined in wallets/<chain-type>/index.ts
    //   the all can share a basic set of options defined in wallets/base-wallet.ts
    //   nodeUrl: 'https://eth.llamarpc.com',
    //   tokenPollConcurrency: 1,
    // },
    addresses: {
      "0x80C67432656d59144cEFf962E8fAF8926599bCF8": ["USDC", "DAI"],
      "0x8d0d970225597085A59ADCcd7032113226C0419d": ["usdc"],
      "0xBd8eDBCad57b5197373309954DD959fCCa40d183": ["Usdc", "Dai"]
    }
  },
  solana: {
    addresses: {
      '6VnfVsLdLwNuuCmooLTziQ99PFXZ5vc3yyqyb9tMDhhw': ['usdc']
    }
  }
}, options);

watcher.start();

watcher.on('balances', (chainName, network, newBalances, lastBalances) => {
  console.log(`Received new balances for chain: ${chainName}-${network}`);
  console.log("Balances updated:", newBalances);
  console.log("Previous balance:", lastBalances);

  console.log("All balances:", watcher.getBalances());
});