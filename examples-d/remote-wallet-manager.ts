import * as fs from 'fs';
import { WalletInterface } from "wallet-monitor";
import {buildClientWalletManager} from "../src/utils";

function readConfig() {
  const filePath = './config.json'
  const fileData = fs.readFileSync(filePath, 'utf-8')

  const parsedData = JSON.parse(fileData)

  if (!parsedData || !parsedData.walletManagerConfig)
    throw new Error('')

  return parsedData
}

const fileConfig = readConfig()

const manager = buildClientWalletManager('localhost', 50051, fileConfig.walletManagerConfig, fileConfig.walletmanagerOptions)

// perform an action with any wallet available in the pool:
const doSomethingWithWallet = async (wallet: WalletInterface) => {
  // do what you need with the wallet
  console.log(
    wallet.provider,
    wallet.address,
    wallet.privateKey,
  );
};

// perform an action with any wallet available in the pool:
manager.withWallet('ethereum', doSomethingWithWallet);

// perform an action with one particular wallet:
manager.withWallet('ethereum', doSomethingWithWallet, {
  // address: '0x80C67432656d59144cEFf962E8fAF8926599bCF8',
});

// configure the timeout for acquiring the wallet to use:
manager.withWallet('solana', doSomethingWithWallet, {
  leaseTimeout: 10_000,
});
