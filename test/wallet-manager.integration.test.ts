import { describe, expect, test } from "@jest/globals";
import { WalletManager, WalletRebalancingConfig } from "../src/wallet-manager";
import { ChainName, DEVNET } from "../src/wallets";
import {
  WalletExecuteOptions,
  WithWalletExecutor,
} from "../src/chain-wallet-manager";
import { ETHEREUM } from "../src/wallets/evm/ethereum.config";
import {
  ETH_ADDR,
  ETH_ADDR_2,
  checkIfWalletIsReady,
  getWallets,
} from "./utilities/wallet";
import { wait } from "./utilities/common";

const WAIT_TO_ACQUIRE_TIMEOUT = 10;

const rebalanceConfig: WalletRebalancingConfig = {
  enabled: true,
  strategy: "pourOver",
  interval: 10000,
  minBalanceThreshold: 0.1,
  maxGasPrice: 10000,
  gasLimit: 1000000,
};
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

  test("should not discard the wallets if native balance is above threshold", async () => {
    await givenAWalletManager(rebalanceConfig);
    await whenWalletCalled(
      ETHEREUM,
      async () => {
        // no op
      },
      { waitToAcquireTimeout: WAIT_TO_ACQUIRE_TIMEOUT },
    );
    const activeWalletsReadyToBeAquired = Object.values(
      walletManager.getChainBalances(ETHEREUM),
    ).length;

    expect(activeWalletsReadyToBeAquired).toEqual(2);
  });

  test("should discard wallet if wallet native balance is below threshold", async () => {
    // Adding 10ETH as balance as min threshold
    const minBalanceThreshold = 10;

    await givenAWalletManager({ ...rebalanceConfig, minBalanceThreshold });

    const settledWithWalletCalls = await Promise.allSettled([
      whenWalletCalled(
        ETHEREUM,
        async () => {
          // no op
        },
        // ETH_ADDR -> 0.2 ETH as balance pre-defined
        { waitToAcquireTimeout: WAIT_TO_ACQUIRE_TIMEOUT, address: ETH_ADDR },
      ),
      whenWalletCalled(
        ETHEREUM,
        async () => {
          // no op
        },
        // ETH_ADDR_2 -> 10 ETH as balance pre-defined
        { waitToAcquireTimeout: WAIT_TO_ACQUIRE_TIMEOUT, address: ETH_ADDR_2 },
      ),
    ]);

    // Below wallet is expected to be rejected as balance is below threshold
    expect(settledWithWalletCalls[0].status).toEqual("rejected");
    // Below wallet is expected to be fulfilled as balance is above threshold
    expect(settledWithWalletCalls[1].status).toEqual("fulfilled");
  });
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
