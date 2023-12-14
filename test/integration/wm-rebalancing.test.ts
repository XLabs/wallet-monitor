import { describe, expect, test } from "@jest/globals";
import {
  WalletManager,
  WalletRebalancingConfig,
} from "../../src/wallet-manager";
import { ChainName, DEVNET } from "../../src/wallets";
import {
  WalletExecuteOptions,
  WithWalletExecutor,
} from "../../src/chain-wallet-manager";
import { ETHEREUM } from "../../src/wallets/evm/ethereum.config";
import {
  ETH_ADDR,
  ETH_ADDR_2,
  checkIfWalletIsReady,
  getWallets,
} from "../utilities/wallet";

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

  test("should not discard the wallets if native balance is above threshold", async () => {
    /**
     * Expected behaviour: Wallets are configured to have balances of 0.2 ETH and 10 ETH
     * and minBalanceThreshold is set to 0.1 ETH, so both wallets should be ready to be acquired
     */
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
    /**
     * Expected behaviour: Wallets are configured to have balances of 0.2 ETH and 10 ETH
     * and minBalanceThreshold is set to 10 ETH
     * so, ETH_ADDR is expected to be rejected as balance is below threshold
     * and ETH_ADDR_2 is expected to be fulfilled as balance is above threshold
     */
    const minBalanceThreshold = 10;

    await givenAWalletManager({ ...rebalanceConfig, minBalanceThreshold });

    const settledWithWalletCalls = await Promise.allSettled([
      whenWalletCalled(
        ETHEREUM,
        async () => {
          // no op
        },
        { waitToAcquireTimeout: WAIT_TO_ACQUIRE_TIMEOUT, address: ETH_ADDR },
      ),
      whenWalletCalled(
        ETHEREUM,
        async () => {
          // no op
        },
        { waitToAcquireTimeout: WAIT_TO_ACQUIRE_TIMEOUT, address: ETH_ADDR_2 },
      ),
    ]);

    expect(settledWithWalletCalls[0].status).toEqual("rejected");
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
