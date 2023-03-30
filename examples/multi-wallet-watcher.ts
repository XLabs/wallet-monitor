import { MultiWalletWatcher } from 'wallet-monitor';

const options = {
  // Passing a logger is optional in case you want to see logs.
  // logger: console,
};

const watcher = new MultiWalletWatcher({
  ethereum: {
    addresses: {
      "0x80C67432656d59144cEFf962E8fAF8926599bCF8": ["USDC", "DAI"],
      "0x8d0d970225597085A59ADCcd7032113226C0419d": ["usdc"],
      "0xBd8eDBCad57b5197373309954DD959fCCa40d183": ["Usdc", "Dai"]
    }
  }
}, options);

watcher.start();

watcher.on('balances', (chainName, newBalances, lastBalances) => {
  console.log("Received new balances for chain:", chainName);
  console.log("Balances updated:", newBalances);
  console.log("Updated balances:", lastBalances);

  console.log("All balances:", watcher.getBalances());
});