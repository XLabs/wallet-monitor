import {
    AcquireLockRequest, AcquireLockResponse,
    ReleaseLockRequest,
    WalletManagerGRPCServiceImplementation
} from "./out/wallet-manager-grpc-service";
import {CallContext} from "nice-grpc-common";
import {DeepPartial, Empty} from "./out/google/protobuf/empty";
import {WalletManager, WalletManagerConfig, WalletManagerOptions} from "../wallet-manager";
import {ChainName} from "../wallets";

export class WalletManagerGRPCService implements WalletManagerGRPCServiceImplementation {
    private underlyingWalletManager;

    constructor(config: WalletManagerConfig, options?: WalletManagerOptions) {
        this.underlyingWalletManager = new WalletManager(config, options);
    }

    async acquireLock(request: AcquireLockRequest, context: CallContext): Promise<DeepPartial<AcquireLockResponse>> {
        const acquiredWallet = await this.underlyingWalletManager.acquireLock(request.chainName as ChainName, {address: request.address, leaseTimeout: request.leaseTimeout})

        return {address: acquiredWallet.address};
    }

    async releaseLock(request: ReleaseLockRequest, context: CallContext): Promise<DeepPartial<Empty>> {
        await this.underlyingWalletManager.releaseLock(request.chainName as ChainName, request.address);

        return {};
    }
}
