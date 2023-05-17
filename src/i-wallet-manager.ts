import {WalletBalancesByAddress, WalletExecuteOptions, WithWalletExecutor} from "./chain-wallet-manager";
import {ChainName} from "./wallets";
import {WalletInterface} from "./wallets/base-wallet";
import {Registry} from "prom-client";

// TODO: Remove all comments about this because it changed a lot since then.
/*
Goals for this interface file:
- In the docker image for WalletMonitor, we should be able to instantiate a WalletManager which will do monitoring,
   rebalancing, exporting, offering locking/releasing capabilities if those things are enabled.
   Then, the gRPC service that interacts with the various instances of the RE, should only see the instantiated
   WalletManager as a IWMLocks and not an entire WalletManager. This would help ensure that the behaviors of
   WalletManager are correctly segregated.
- When using the WalletManager docker image, we don't foresee that the RE would ever want to do monitoring, exporting
   or rebalancing. Those are tasks that are difficult to do when coordinating multiple RE replicas that will all
   attempt at doing them concurrently. They are better suited in the image when multiple RE instances are up and
   therefore in that case RE would only need to see a component implementing IWMLocks interface (which will
   hook into the gRPC service with a client).
- The only exported interface that should actually be for a different class, is IClientWalletManager.
   The class implementing this will obviously just be a client for the remote gRPC service.
   Potentially a WalletManager implements IClientWalletManager, so it's care of the dev/library to make sure that
   the appropriate class is used in each circumstance.
*/

/*
NOTES ON THIS INTERFACE INHERITANCE HIERARCHY:
- Ideally, there would be different .on() methods to register as a listener depending on the 3 categories that
   are in use as of now:
   - Errors in the underlying chainManager
   - Balance monitoring
   - Rebalancing info
   If that were the case, we could actually have different signatures for each interface. We don't, so we put the same
   in all behaviors that use it. We are putting it in IWMBaseWalletManager which renders the other two useless in the
   final interface. We choose to leave them this way because, along this note, is a reminder that in the future
   we would want to actually make 3 separate .on() methods.
*/

interface IWMContextManagedLocks {
    withWallet(chainName: ChainName, fn: WithWalletExecutor, opts?: WalletExecuteOptions): Promise<void>
}
interface IWMBareLocks {
    acquireLock(chainName: ChainName, opts?: WalletExecuteOptions): Promise<WalletInterface>
    releaseLock(chainName: ChainName, address: string): Promise<void>
}

export type ILibraryWalletManager = IWMContextManagedLocks
export type IClientWalletManager = IWMContextManagedLocks
export type IServiceWalletManager = IWMBareLocks