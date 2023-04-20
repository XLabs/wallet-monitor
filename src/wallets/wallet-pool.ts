import { WalletInterface, WalletPool } from './base-wallet';

type Resource = {
  id: string;
  locked: boolean;
  // timeoutTimerId: NodeJS.Timeout | null;
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

  public async acquire(): Promise<string> {
    const resource = Object.values(this.resources).find((resource) => !resource.locked);
    if (!resource) throw new Error('No resources available');
    resource.locked = true;
    return resource.id;
  }

  public async release(walletAddress: string): Promise<void> {
    const resource = this.resources[walletAddress];
    if (!resource) throw new Error(`No resource found for ${walletAddress}`);
    resource.locked = false;
  }
}
