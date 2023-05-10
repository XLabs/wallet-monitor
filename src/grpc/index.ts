const { WalletManagerClient } = require('./wallet-manager_grpc_pb')
const { AcquireLockRequest, ReleaseLockRequest } = require('./wallet-manager_pb')

module.exports = { WalletManagerClient, AcquireLockRequest, ReleaseLockRequest }
