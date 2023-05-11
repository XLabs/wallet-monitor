import {buildWalletManager} from "../utils";

const {
  GetAllBalancesResponse,
  WalletBalanceByAddress,
  WalletBalanceByToken,
  Balance,
  AcquireLockResponse,
  Empty
} = require('./out/wallet-manager_pb');

const { WalletManagerService } = require('./out/wallet-manager_grpc_pb');
const { WalletManager } = require('../wallet-manager')
import { IServiceWalletManager } from '../i-wallet-manager';
import { WalletBalancesByAddress } from '../single-wallet-manager';
const { Server, ServerCredentials } = require('@grpc/grpc-js');
const fs = require("fs");

function readConfig() {
  const filePath = '/etc/wallet-manager/config.json'
  // const filePath = '../examples-d/wallet-manager-config.json'
  const fileData = fs.readFileSync(filePath, 'utf-8')

  const parsedData = JSON.parse(fileData)

  if (!parsedData || !parsedData.walletManagerConfig)
    throw new Error('')

  return parsedData
}

const fileConfig = readConfig();

// const walletManager: IServiceWalletManager = new WalletManager(fileConfig.walletManagerConfig, fileConfig.walletManagerOptions);
const walletManager = buildWalletManager('service', fileConfig.walletManagerConfig, fileConfig.walletManagerOptions)

function __populateWalletBalanceByToken(chainBalances: WalletBalancesByAddress, wrappedAddressBalances: any) {
    Object.entries(chainBalances).forEach(([address, addressBalances]) => {
      const wrappedTokenBalances = new WalletBalanceByToken();
      const nativeBalance = new Balance();
      nativeBalance.setAddress(addressBalances.address);
      nativeBalance.setIsNative(true);
      nativeBalance.setSymbol(addressBalances.symbol);
      nativeBalance.setRawBalance(addressBalances.rawBalance);
      nativeBalance.setFormattedBalance(addressBalances.formattedBalance);
      wrappedTokenBalances.setNativeBalance(nativeBalance);
      addressBalances.tokens.forEach((tokenBalance) => {
        const wrappedBalance = new Balance();
        wrappedBalance.setAddress(tokenBalance.address);
        wrappedBalance.setIsNative(tokenBalance.isNative);
        wrappedBalance.setSymbol(tokenBalance.symbol);
        wrappedBalance.setRawBalance(tokenBalance.rawBalance);
        wrappedBalance.setFormattedBalance(tokenBalance.formattedBalance);
        if (!tokenBalance.tokenAddress)
          wrappedBalance.setTokenAddress(tokenBalance.tokenAddress);
        wrappedTokenBalances
            .getTokenBalancesMap(false)
            .set(tokenBalance.address, wrappedBalance);
      })
      wrappedAddressBalances
          .getBalancesMap(false)
          .set(address, wrappedTokenBalances);
    })
  }

function getAllBalances(call: any, callback: any) {
  const unwrappedReply = walletManager.getAllBalances();
  const reply = new GetAllBalancesResponse();

  Object.entries(unwrappedReply).forEach(([chainName, chainBalances]) => {
    const wrappedAddressBalances = new WalletBalanceByAddress();
    __populateWalletBalanceByToken(chainBalances, wrappedAddressBalances);
    reply
        .getAllBalancesMap(false)
        .set(chainName, wrappedAddressBalances);
  })
  callback(null, reply);
}

async function acquireLock(call: any, callback: any) {
  const chainName = call.request.getChainName()
  const address = call.request.hasAddress() ? call.request.getAddress() : undefined
  const leaseTimeout = call.request.hasLeaseTimeout() ? call.request.getLeaseTimeout() : undefined
  const acquiredWallet = await walletManager.acquireLock(chainName, {address, leaseTimeout})

  const reply = new AcquireLockResponse()
  reply.setAddress(acquiredWallet.address)

  callback(null, reply)
}

async function releaseLock(call: any, callback: any) {
  const [chainName, address] = [call.request.getChainName(), call.request.getAddress()]

  await walletManager.releaseLock(chainName, address)

  const reply = new Empty()

  callback(null, reply)
}

function getChainBalances(call: any, callback: any) {
  const unwrappedReply = walletManager.getChainBalances(call.request.getChainName());
  const reply = new WalletBalanceByAddress();
  __populateWalletBalanceByToken(unwrappedReply, reply);

  callback(null, reply)
}

function run_wallet_manager_grpc_service() {
  const server = new Server();
  server.addService(
      WalletManagerService,
      {
        getAllBalances,
        getChainBalances,
        acquireLock,
        releaseLock,
      });
  server.bindAsync('0.0.0.0:50051', ServerCredentials.createInsecure(), () => {
    server.start();
  });

  return server
}

const server = run_wallet_manager_grpc_service()

process.on('SIGTERM', function () {
  console.log('Shutting down service...')
  // Starting a graceful shutdown and a non-graceful shutdown with a timer.
  // tryShutdown and forceShutdown are idempotent between themselves and each other.
  // Therefore, it is correct if those function execute simultaneously.
  setTimeout(function () {
    server.forceShutdown()
    console.log('Shutting down timed out (5 seconds).')
    process.exit(1)
  }, 5_000)

  server.tryShutdown((error?: any) => {
    if (error) {
      console.log("Graceful shutdown was unsuccessful: ", error);
      process.exit(1);
    }
    else {
      console.log('Done shutting down.');
      process.exit();
    }
  });
})