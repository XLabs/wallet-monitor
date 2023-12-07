import {Providers, WalletBalancesByAddress, WalletExecuteOptions, WalletInterface, Wallets, WithWalletExecutor} from "./chain-wallet-manager";
import { ChainName } from "./wallets";

/*
 This file defines interfaces to be used as a mask for the WalletManager class.
 The WalletManager class is currently doing a lot of things that require care and knowledge of the how to handle it.
 Instead of going into a refactor of the class itself, we use these interfaces to expose only the minimal set
 of methods that are needed depending on the context.
 As of today, these are the contexts:
 - Library: Users import WalletManager from the package and integrate it into their code.
 - Service: The class is used by the gRPC service to implement its endpoints through composition with WalletManager.
 - Client: The class is used by the gRPC client to call the service.

 Library and Client need to both expose the same convenience .withWallet() method, but they need to do it in different ways.
 Service needs to expose the bare .acquireLock() and .releaseLock() methods in order for the gRPC service to wrap them in its own methods.
*/

interface IWMContextManagedLocks {
    withWallet<P extends Providers, W extends Wallets>(chainName: ChainName, fn: WithWalletExecutor, opts?: WalletExecuteOptions): Promise<void>;
    pullBalances: () => Promise<Record<string, WalletBalancesByAddress>>;
    pullBalancesAtCurrentBlockHeight: () => Promise<Record<string, WalletBalancesByAddress>>;
    getBlockHeight: (chainName: ChainName) => Promise<number>;
    getBlockHeightForAllSupportedChains: () => Promise<Record<ChainName, number>>;
}
interface IWMBareLocks {
    acquireLock(chainName: ChainName, opts?: WalletExecuteOptions): Promise<WalletInterface>
    releaseLock(chainName: ChainName, address: string): Promise<void>
}

export type ILibraryWalletManager = IWMContextManagedLocks
export type IClientWalletManager = IWMContextManagedLocks
export type IServiceWalletManager = IWMBareLocks
