import {
    AcquireLockRequest, AcquireLockResponse,
    ReleaseLockRequest,
    WalletManagerGRPCServiceImplementation
} from "./out/wallet-manager-grpc-service";
import {CallContext} from "nice-grpc-common";
import {DeepPartial, Empty} from "./out/google/protobuf/empty";
import {ChainName} from "../wallets";
import {IServiceWalletManager} from "../i-wallet-manager";
import {Level} from "level";

export class WalletManagerGRPCService implements WalletManagerGRPCServiceImplementation {

    constructor(private underlyingWalletManager: IServiceWalletManager, private db: Level) {
        // TODO:
        //  1. Remove from db all keys that are not in the set of addresses in the underlyingWalletManager.
        //   If the set of keys changes between restarts, we don't want to keep the old keys in the db.
        //  2. Use the persisted state of the locks in the db to re-acquire wallets in underlyingWalletManager.
        //  3. Make sure that WalletManager is async-safe when locking a wallet.
        //  4. Use async-mutex when making an update to the db. If WalletManager is async-safe this shouldn't be needed.
        //   But for the moment let's employ it anyway until it's absolutely clear that the WalletManager is async-safe.
    }

    async acquireLock(request: AcquireLockRequest, context: CallContext): Promise<DeepPartial<AcquireLockResponse>> {
        const acquiredWallet = await this.underlyingWalletManager.acquireLock(request.chainName as ChainName, {address: request.address, leaseTimeout: request.leaseTimeout})
        // FIXME: Extract the logic of getting from chain + address to a key in the db in a separate function.
        await this.db.put(request.chainName + acquiredWallet.address, "locked");

        return { address: acquiredWallet.address };
    }

    async releaseLock(request: ReleaseLockRequest, context: CallContext): Promise<DeepPartial<Empty>> {
        await this.underlyingWalletManager.releaseLock(request.chainName as ChainName, request.address);
        await this.db.put(request.chainName + request.address, "unlocked");

        return {};
    }
}
