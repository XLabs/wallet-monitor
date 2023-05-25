# Wallet Monitor gRPC Service

This is a gRPC wrapper for the `WalletMonitor`.
The goal of this service is to enable moving to a distributed architecture for scalability or high availability reasons.

## Motivation
With `WalletMonitor` implementing at least monitoring, locking and rebalancing, it was proving difficult for
multiple application clients to all own a `WalletManager` in *library modality*.  
This is because while it is desirable for all clients to be able to monitor or trying locking the same wallet, it is not desirable
for all clients to be able to rebalance the same set of wallets.

This motivated us to move to develop the option of instantiating a `WalletManager` in *service modality* within a distributed architecture.
This allows for centralized rebalancing while still maintaining the ability for each application instance to instantiate a client
pointing to the service for monitoring and locking.

## Usage
The same configuration previously used for the *library modality* can also be used for both the *service modality* and the client object.
Once again, pointing to the relevant schema is the best way to explain the configuration options.
```typescript
const schema = z.object({
    config: WalletManagerConfigSchema,
    options: WalletManagerOptionsSchema.optional(),
    grpc: WalletManagerGRPCConfigSchema
})
```
It is sufficient to add the `grpc` section to the configuration file.

### Building the docker image
```bash
npm run build-docker-image
```
### Running the service
```bash
docker run -p 50051:50051 -v <<path to your host machine config folder>>/config.json:/etc/wallet-manager/config.json -d wallet-manager:latest
```

### Client
Use of the utility function `buildWalletManager` is highly recommended in this case because it will automatically
infer from the configuration object/file whether to build an actual `WalletManager` or a `WalletManagerClient` object.  
In either case, the user will only see an interface that only allows locking since that's the only functionality that is
supported when running in *service modality*.

### Example
Please refer to [this example](../../examples-d/remote-wallet-manager.ts) for a more detailed usage of the service.
