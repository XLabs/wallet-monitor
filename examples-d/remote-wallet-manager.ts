import * as fs from "fs";
import { WalletInterface } from "wallet-monitor";
import { buildWalletManager } from "../src";

function readConfig() {
  const filePath = "./config.json";
  const fileData = fs.readFileSync(filePath, "utf-8");

  return JSON.parse(fileData);
}

const fileConfig = readConfig();

const walletManager = buildWalletManager(fileConfig);

// perform an action with any wallet available in the pool:
const doSomethingWithWallet = async (wallet: WalletInterface) => {
  // do what you need with the wallet
  console.log(
    wallet.address,
    /**
     * You should never ever log your private keys.
     * This is just an example, to show what information you get from the interface provided.
     * Uncomment under your own risk ☠️
     */
    // wallet.privateKey,
  );
};

// perform an action with any wallet available in the pool:
walletManager.withWallet("ethereum", doSomethingWithWallet);

// perform an action with one particular wallet:
walletManager.withWallet("ethereum", doSomethingWithWallet, {
  // address: '0x80C67432656d59144cEFf962E8fAF8926599bCF8',
});

// configure the timeout for acquiring the wallet to use:
walletManager.withWallet("solana", doSomethingWithWallet, {
  leaseTimeout: 10_000,
});
