const {
  GetAllBalancesResponse,
  WalletBalanceByAddress,
  WalletBalanceByToken,
  Balance,
  AcquireLockResponse,
  Empty
} = require('./wallet-manager_pb');
const { WalletManagerService } = require('./wallet-manager_grpc_pb');

const { Server, ServerCredentials } = require('@grpc/grpc-js');
const { WalletManager } = require('../../wallet-manager-service/service/wallet-monitor/src');

// FIXME: Get starting arguments the same way that WalletManager does and then wrap
//  this example in the example folder.
const options = {
  // logger: console,
  logLevel: 'debug',
  balancePollInterval: 10000,
  metrics: {
    enabled: true,
    serve: true,
    port: 9091,
  }
};

const allChainWallets = {
  ethereum: {
    wallets: [
      {
        address: "0x80C67432656d59144cEFf962E8fAF8926599bCF8",
        tokens: ["USDC", "DAI"]
      },
      {
        address: "0x8d0d970225597085A59ADCcd7032113226C0419d",
        tokens: []
      }
    ]
  },
  solana: {
    wallets: [
      { address: "6VnfVsLdLwNuuCmooLTziQ99PFXZ5vc3yyqyb9tMDhhw", tokens: ['usdc'] },
    ],
  }
};

const walletManager = new WalletManager(allChainWallets, options);

function __populateWalletBalanceByToken(chainBalances, wrappedAddressBalances) {
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

function getAllBalances(call, callback) {
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

async function acquireLock(call, callback) {
  const chainName = call.request.getChainName()
  const address = call.request.hasAddress() ? call.request.getAddress() : undefined
  const leaseTimeout = call.request.hasLeaseTimeout() ? call.request.getLeaseTimeout() : undefined
  const acquiredWallet = await walletManager.acquireLock(chainName, {address, leaseTimeout})

  const reply = new AcquireLockResponse()
  reply.setAddress(acquiredWallet.address)

  callback(null, reply)
}

async function releaseLock(call, callback) {
  const [chainName, address] = [call.request.getChainName(), call.request.getAddress()]

  await walletManager.releaseLock(chainName, address)

  const reply = new Empty()

  callback(null, reply)
}

function getChainBalances(call, callback) {
  const unwrappedReply = walletManager.getChainBalances(call.request.getChainName());
  const reply = new WalletBalanceByAddress();
  __populateWalletBalanceByToken(unwrappedReply, reply);

  callback(null, reply)
}

function main() {
  const server = new Server();
  server.addService(
      WalletManagerService,
      {
        getAllBalances,
        getChainBalances,
        acquireLock,
        releaseLock,
      });
  server.bindAsync('localhost:50051', ServerCredentials.createInsecure(), () => {
    server.start();
  });
}

process.on('SIGINT', function() { process.exit() })

main();
