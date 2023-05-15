import {WalletBalancesByAddress, WalletExecuteOptions, WithWalletExecutor} from "./chain-wallet-manager";
import {ChainName} from "./wallets";
import {WalletInterface} from "./wallets/base-wallet";
import {Registry} from "prom-client";

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
THE FOLLOWING POINT IS LEFT HERE FOR HISTORIC DOCUMENTATION UNTIL THE NEXT ITERATION IS READY
- The gRPC service is using bare acquire/release WalletManager calls because it is tying them to acquire/release requests.
   Ideally, IWMLocks should only be .withWallet(). There's no use case for the RE using those bare calls outside
   the context of a relaying job. Also, this would put the business logic of throwing an error immediately if the gRPC
   service crashes and not waiting until the release request is sent to figure out that the service crashed.
   This would necessarily need to be implemented as a long-lived unary request. When the request ends, the lock is released.
   I'm not sure if gRPC can handle this kind of thing with heartbeats.
   If this is possible, it would be awesome to replicate a python context manager implementation where the relaying job
   is aborted/rolled back if the lock is lost before releasing.
- This point overrides the preceding one. The problem with a single long-lived unary request is that it still does not
   guarantee persistence of the state of the locks. It also does not play nicely with live upgrades.
   Figuring out if the service has crashed could be achieved by inspecting the state of the gRPC channel (not the gRPC request).
   If that connection is not alive anymore, rollback all current jobs. We would still like to only have .withWallet
   on the local hook and bare acquire/release on the WalletManager used within the gRPC service.
   We can do this by having two different IWMLock interfaces (one with bare methods, the other with .withWallet()).
   Then, two different IWalletManager interfaces extending from each IWMLock interface.
   WalletManager class should implement everything but only the things behind the interface are available to the
   code that is instantiating it.
- The only exported interface that should actually be for a different class, is IClientWalletManager.
   The class implementing this will obviously just be a client for the remote gRPC service.
   Potentially a WalletManager implements IClientWalletManager, so it's care of the dev/library to make sure that
   the appropriate class is used in each circumstance.
- To avoid having the user knowing about this fact and loading them with the burden of knowing all interfaces and classes,
   we should provide convenience factory functions. TODO
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
interface IWMBaseWalletManager {
    stop(): void
    on(event: string, listener: (...args: any[]) => void): void
}
interface IWMBalanceMonitor {
    getAllBalances(): Record<string, WalletBalancesByAddress>
    getChainBalances(chainName: ChainName): WalletBalancesByAddress
    on(event: string, listener: (...args: any[]) => void): void
}
interface IWMRebalancer {
    on(event: string, listener: (...args: any[]) => void): void
}
interface IWMBalanceExporter {
    metrics(): Promise<string> | undefined
    getRegistry(): Registry | undefined
}
interface IWMContextManagedLocks {
    withWallet(chainName: ChainName, fn: WithWalletExecutor, opts?: WalletExecuteOptions): Promise<void>
}
interface IWMBareLocks {
    acquireLock(chainName: ChainName, opts?: WalletExecuteOptions): Promise<WalletInterface>
    releaseLock(chainName: ChainName, address: string): Promise<void>
}

export interface ILibraryWalletManager extends IWMBaseWalletManager, IWMBalanceMonitor, IWMBalanceExporter, IWMRebalancer, IWMContextManagedLocks {}
export interface IServiceWalletManager extends IWMBaseWalletManager, IWMBalanceMonitor, IWMBalanceExporter, IWMRebalancer, IWMBareLocks {}
export interface IClientWalletManager extends IWMContextManagedLocks {}