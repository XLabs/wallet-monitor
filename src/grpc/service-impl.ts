import {
  AcquireLockRequest,
  AcquireLockResponse,
  ReleaseLockRequest,
  WalletManagerGRPCServiceImplementation,
} from "./out/wallet-manager-grpc-service";
import { CallContext } from "nice-grpc-common";
import { DeepPartial, Empty } from "./out/google/protobuf/empty";
import { IServiceWalletManager } from "../i-wallet-manager";
import { ChainName } from "../wallets";

export class WalletManagerGRPCService
  implements WalletManagerGRPCServiceImplementation
{
  constructor(private underlyingWalletManager: IServiceWalletManager) {}

  async acquireLock(
    request: AcquireLockRequest,
    context: CallContext,
  ): Promise<DeepPartial<AcquireLockResponse>> {
    const acquiredWallet = await this.underlyingWalletManager.acquireLock(
      request.chainName as ChainName,
      {
        address: request.address,
        leaseTimeout: request.leaseTimeout,
        waitToAcquireTimeout: request.acquireTimeout,
      },
    );

    return { address: acquiredWallet.address };
  }

  async releaseLock(
    request: ReleaseLockRequest,
    context: CallContext,
  ): Promise<DeepPartial<Empty>> {
    await this.underlyingWalletManager.releaseLock(
      request.chainName as ChainName,
      request.address,
    );

    return {};
  }
}
