import { MultiWalletWatcher } from 'wallet-monitor';

const watcher = new MultiWalletWatcher({
    ethereum: {
        addresses: {
            "0x80C67432656d59144cEFf962E8fAF8926599bCF8": ["USDC", "DAI"],
            "0x8d0d970225597085A59ADCcd7032113226C0419d": ["usdc"],
            "0xBd8eDBCad57b5197373309954DD959fCCa40d183": ["Usdc", "Dai"]
        }
    }
}, {
    logger: console
});

watcher.start();

watcher.on('balances', (chainName, newBalances, lastBalances) => {
    console.log("received new balances for chain:", chainName);
    console.log("Balances updated:", newBalances);
    console.log("All balances:", lastBalances);

    console.log("All balances:", watcher.getBalances());
});