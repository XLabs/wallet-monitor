import { WalletInterface, WalletPool } from './base-wallet';

type Resource = {
  id: string;
  locked: boolean;
}

type ResourcePool = Record<string, Resource>;

export class LocalWalletPool implements WalletPool {
  private resources: ResourcePool = {};

  constructor(walletAddresses: string[]) {
    for (const address of walletAddresses) {
      this.resources[address] = {
        id: address,
        locked: false,
      };
    }
  }

  public async acquire(resourceId?: string): Promise<string> {
    const resource = resourceId
      ? this.resources[resourceId]
      : Object.values(this.resources).find((resource) => !resource.locked);

    if (!resource) throw new Error('Resource not available');

    resource.locked = true;

    return resource.id;
  }

  public blockAndAquire(blockTimeout: number, resourceId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeoutTimerId = setTimeout(() => {
        reject(new Error('Timed out waiting for resource'));
      }, blockTimeout);

      const acquire = async () => {
        try {
          const walletAddress = await this.acquire(resourceId);
          clearTimeout(timeoutTimerId);
          resolve(walletAddress);
        } catch (error) {
          setTimeout(acquire, 5);
        }
      }

      acquire();
    });
  }

  public async release(walletAddress: string): Promise<void> {
    const resource = this.resources[walletAddress];
    if (!resource) throw new Error(`Resource "${walletAddress}" not found`);
    resource.locked = false;
  }
}
