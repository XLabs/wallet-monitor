import { Resource } from "./resource";

export interface WalletPool {
  blockAndAcquire(blockTimeout: number, resourceId?: string): Promise<string>;
  release(wallet: string): Promise<void>;
  discardWalletFromPool(wallet: string): void;
  addWalletBackToPoolIfRequired(wallet: string): void;
}

type ResourcePool = Record<string, Resource>;

export class LocalWalletPool implements WalletPool {
  private resources: ResourcePool = {};

  constructor(walletAddresses: string[]) {
    for (const address of walletAddresses) {
      this.resources[address] = new Resource(address)
    }
  }

  private async acquire(resourceId?: string): Promise<string> {
    const resource = resourceId
      ? this.resources[resourceId]
      : Object.values(this.resources).find(
          resource => resource.isAvailable(),
        );

    if (!resource || !resource?.isAvailable())
      throw new Error("Resource not available");

    resource.lock();

    return resource.getId();
  }

  public discardWalletFromPool(resourceId: string): void {
    if (resourceId in this.resources) {
      this.resources[resourceId].discard();
    } else {
      throw new Error(`Resource ${resourceId} not available for discarding`);
    }
  }

  public addWalletBackToPoolIfRequired(resourceId: string): void {
    if (resourceId in this.resources && this.resources[resourceId].isDiscarded()) {
      this.resources[resourceId].retain();
    }
  }

  /**
   * @param blockTimeout Milliseconds until the operation is timed out.
   */
  public blockAndAcquire(blockTimeout: number, resourceId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // `process.hrtime` provides the closest we can get to a monotonically increasing clock.
      const timeoutTimestamp = process.hrtime.bigint() + (BigInt(blockTimeout) * 10n ** 6n);
      // We create an error here to get the stack trace up until this point and preserve it into the asynchronous events.
      const errorWithCtx = new Error();

      const acquire = async () => {
        try {
          const walletAddress = await this.acquire(resourceId);
          resolve(walletAddress);
        } catch (error) {
          if (process.hrtime.bigint() < timeoutTimestamp) {
            setTimeout(acquire, 5);
          } else {
            errorWithCtx.message = 'Timed out waiting for resource';
            reject(errorWithCtx);
          }
        }
      }

      acquire();
    });
  }

  public async release(walletAddress: string): Promise<void> {
    const resource = this.resources[walletAddress];
    if (!resource) throw new Error(`Resource "${walletAddress}" not found`);
    resource.unlock();
  }
}
