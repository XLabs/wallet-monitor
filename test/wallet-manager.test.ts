import { describe, expect, test } from "@jest/globals";
import { WalletManager, WalletRebalancingConfig } from "../src/wallet-manager";
import { ChainName, DEVNET } from "../src/wallets";
import {
  WalletExecuteOptions,
  WithWalletExecutor,
} from "../src/chain-wallet-manager";
import { ETHEREUM } from "../src/wallets/evm/ethereum.config";
import {
  ETH_ADDR_2,
  checkIfWalletIsReady,
  getWallets,
} from "./utilities/wallet";
import { wait } from "./utilities/common";

const WAIT_TO_ACQUIRE_TIMEOUT = 10;

let walletManager: WalletManager;

describe("wallet-manager", () => {
  afterEach(() => {
    walletManager.stop();
  });

  test("should execute sequentially per address", async () => {
    const markers: number[] = [];
    await givenAWalletManager();

    await Promise.all([
      whenWalletCalled(ETHEREUM, async () => {
        markers.push(0);
      }),
      whenWalletCalled(ETHEREUM, async () => {
        markers.push(1);
      }),
    ]);

    expect(markers).toEqual([0, 1]);
  });

  test("should continue when something goes wrong", async () => {
    const markers: number[] = [];

    await givenAWalletManager();

    await Promise.allSettled([
      whenWalletCalled(ETHEREUM, async () => {
        throw new Error("oops");
      }),
      whenWalletCalled(
        ETHEREUM,
        async () => {
          markers.push(1);
        },
        { waitToAcquireTimeout: 50 },
      ),
    ]);

    expect(markers).toEqual([1]);
  });

  test("should fail if timeout is reached", async () => {
    /**
     * Expected behaviour: If one wallet A is already aquired and locked
     * Then, anyone else trying to acquire the same wallet A should fail
     */
    const markers: number[] = [];

    await givenAWalletManager();

    const settledWithWalletCalls = await Promise.allSettled([
      whenWalletCalled(
        ETHEREUM,
        async () => {
          await wait(WAIT_TO_ACQUIRE_TIMEOUT * 2);
          markers.push(0);
        },
        { waitToAcquireTimeout: WAIT_TO_ACQUIRE_TIMEOUT, address: ETH_ADDR_2 },
      ),
      whenWalletCalled(
        ETHEREUM,
        async () => {
          markers.push(1);
        },
        { waitToAcquireTimeout: WAIT_TO_ACQUIRE_TIMEOUT, address: ETH_ADDR_2 },
      ),
    ]);

    expect(markers).toEqual([0]);
    expect(settledWithWalletCalls[1].status).toBe("rejected");
  }, 20_000);
});

const givenAWalletManager = async (
  rebalanceConfig: WalletRebalancingConfig = { enabled: false },
) => {
  const cfg = {
    [ETHEREUM]: {
      rebalance: rebalanceConfig,
      network: DEVNET,
      wallets: getWallets(),
    },
  };

  walletManager = new WalletManager(cfg);
  await checkIfWalletIsReady(walletManager);
};

const whenWalletCalled = async (
  chain: ChainName,
  executor: WithWalletExecutor,
  walletOpts?: WalletExecuteOptions,
) => walletManager.withWallet(chain, executor, walletOpts);
