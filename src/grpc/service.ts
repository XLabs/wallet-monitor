import {buildWalletManager} from "../utils";
import { z } from 'zod';

const {
  AcquireLockResponse,
  Empty
} = require('./out/wallet-manager_pb');

const { WalletManagerService } = require('./out/wallet-manager_grpc_pb');
import { WalletBalancesByAddress } from '../chain-wallet-manager';
import {WalletManagerConfigSchema, WalletManagerOptionsSchema} from "../wallet-manager";
const { Server, ServerCredentials } = require('@grpc/grpc-js');
const fs = require("fs");

// FIXME: Yeet all code related to importing config/options in favor of a schema validation library
//  (and check that the validation transpiles to js as well so we can basically forget about it everywhere).
function readConfig() {
  const filePath = '/etc/wallet-manager/config.json'
  const fileData = fs.readFileSync(filePath, 'utf-8')
  const parsedData = JSON.parse(fileData)

  const schema = z.object({
    config: WalletManagerConfigSchema,
    options: WalletManagerOptionsSchema.optional(),
  })

  return schema.parse(parsedData)
}

const fileConfig = readConfig();

const walletManager = buildWalletManager('service', fileConfig.config, fileConfig.options)

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

function run_wallet_manager_grpc_service() {
  const server = new Server();
  server.addService(
      WalletManagerService,
      {
        acquireLock,
        releaseLock,
      });
  // FIXME: Get this host and port from config/env vars
  server.bindAsync('0.0.0.0:50051', ServerCredentials.createInsecure(), () => {
    server.start();
  });

  return server
}

const server = run_wallet_manager_grpc_service()

// FIXME: This only handles the signal sent by docker. It does not handle keyboard interrupts.
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
    } else {
      console.log('Done shutting down.');
      process.exit();
    }
  });
})
