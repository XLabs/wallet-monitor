import { describe, expect, afterEach, test } from "@jest/globals";
import { WalletManager } from "../src/wallet-manager";
import { ChainName } from "../src/wallets";
import { WithWalletExecutor } from "../src/chain-wallet-manager";
import { ETHEREUM } from "../src/wallets/evm/ethereum.config";

const ETH_ADDR = "0x80C67432656d59144cEFf962E8fAF8926599bCF8";
let walletManager: WalletManager;

describe("wallet-manager", () => {
    afterEach(() => {
        walletManager.stop();
    });

    test("should execute sequentially per address", async () => {
        const markers: number[] = [];

        givenAWalletManager();

        await Promise.all([
            await whenWalletCalled(ETHEREUM, async () => { markers.push(0); }),
            await whenWalletCalled(ETHEREUM, async () => { markers.push(1); })
        ]);

        expect(markers).toEqual([0, 1]);
    });

    test("should continue when something goes wrong", async () => {
        const markers: number[] = [];

        givenAWalletManager();

        await Promise.allSettled([
            whenWalletCalled(ETHEREUM, async () => { throw new Error("oops"); }),
            whenWalletCalled(ETHEREUM, async () => { markers.push(1); }, 50)
        ]);

        expect(markers).toEqual([1]);
    });

    test("should fail if timeout is reached", async () => {
        const markers: number[] = [];
        const waitToAcquireTimeout = 10;

        givenAWalletManager();

        const settledWithWalletCalls = await Promise.allSettled([
            whenWalletCalled(ETHEREUM, async () => {
                await delay(waitToAcquireTimeout * 2)
                markers.push(0);
            }, waitToAcquireTimeout),
            whenWalletCalled(ETHEREUM, async () => { markers.push(1); }, waitToAcquireTimeout)
        ]);

        expect(markers).toEqual([0]);
        expect(settledWithWalletCalls[1].status).toBe("rejected");
    }, 20_000);

});

const delay = (ms: number) => new Promise((resolve, reject) => setTimeout(resolve, ms));

const givenAWalletManager = (rebalance: boolean = false) => {
    const cfg = {
        [ETHEREUM]: {
            rebalance: {
                enabled: rebalance,
            },
            wallets: [
                {
                    address: ETH_ADDR,
                    tokens: ["USDC"],
                },
            ],
        }
    };

    walletManager = new WalletManager(cfg);
};

const whenWalletCalled = (chain: ChainName, executor: WithWalletExecutor, waitToAcquireTimeout: number = 1000) => 
    walletManager.withWallet(chain, executor, { waitToAcquireTimeout });

