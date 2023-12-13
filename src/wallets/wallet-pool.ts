import { printError } from "../utils";
import { Resource } from "./resource";

export interface WalletPool {
  blockAndAcquire(blockTimeout: number, resourceId?: string): Promise<string>;
  release(wallet: string): Promise<void>;
  discardWalletFromPool(wallet: string): void;
  addWalletBackToPoolIfRequired(wallet: string): void;
}

type GetBalanceFn = () => number | string;

type ResourceWithBalance =  { resource: Resource, getBalance: GetBalanceFn };

type ResourcePool = Record<string, ResourceWithBalance>;

export interface WalletOption{
  /** Wallet address */
  address: string
  /** Function to get wallet balance. Optional.
   * @returns Wallet balance in formatted.
   */
  getBalance: GetBalanceFn
}

export interface WalletPoolOptions{
  walletOptions: WalletOption[]
}

export class LocalWalletPool implements WalletPool {
  private resources: ResourcePool = {};

  constructor(options: WalletPoolOptions) {
    for (const {address, getBalance} of options.walletOptions) {
      this.resources[address] = {
        resource: new Resource(address),
        getBalance: getBalance
      }
    }
  }

  // TODO: AddOrDiscard wallets when calling this method
  private async acquire(resourceId?: string): Promise<string> {
    const resource = resourceId
      ? this.resources[resourceId].resource
      : this.getHighestBalanceWallet()?.resource;

      
      if (!resource || !resource?.isAvailable())
      throw new Error("Resource not available");
    
    resource.lock();

    return resource.getId();
  }

  private getHighestBalanceWallet(): ResourceWithBalance | undefined {
    if(!this.availableResources.length) return

    return this.availableResources.reduce((acc, curr) => {
      if(!acc) return curr

      if(curr.getBalance && acc.getBalance) {
        return curr.getBalance() > acc.getBalance() ? curr : acc
      }

      return acc
    })
  }

  private get availableResources(): ResourceWithBalance[] {
    return Object.values(this.resources).filter((rs) => rs.resource.isAvailable())
  }

  public discardWalletFromPool(resourceId: string): void {
    if (resourceId in this.resources) {
      this.resources[resourceId].resource.discard();
    } else {
      throw new Error(`Resource ${resourceId} not available for discarding`);
    }
  }

  public addWalletBackToPoolIfRequired(resourceId: string): void {
    if (resourceId in this.resources && this.resources[resourceId].resource.isDiscarded()) {
      this.resources[resourceId].resource.retain();
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
            errorWithCtx.message = `Timed out waiting for resource. Wrapped error: ${printError(error)}`;
            reject(errorWithCtx);
          }
        }
      }

      acquire();
    });
  }

  public async release(walletAddress: string): Promise<void> {
    const resource = this.resources[walletAddress].resource
    if (!resource) throw new Error(`Resource "${walletAddress}" not found`);
    resource.unlock();
  }
}
