import { describe, expect, jest, test } from '@jest/globals';

import { SuiWalletOptions, SuiWalletToolbox } from "./";
import { SUI, SUI_MAINNET } from "./sui.config";
import { WalletConfig } from "../index";
import * as winston from "winston";
import { pullSuiTokenData } from "../../balances/sui";

jest.mock("../../balances/sui", () => ({
    pullSuiTokenBalances: jest.fn(() => [
        {
            coinType: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
            totalBalance: "100000000"
        },
        {
            coinType: "0xfded065d61215141ea7afac2e5c1a7b23514a91cbb2cfd86a38ed97e2f7871ac::PEPE::PEPE",
            totalBalance: "500000000"
        }
    ]),
    formatUnits: jest.fn((units: string, decimals: number) => {
        return String(+units / 10 ** decimals);
    }),
    pullSuiTokenData: jest.fn((conn, address) => {
        switch(address) {
            case "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN":
                return {
                    symbol: "USDC",
                    decimals: 6,
                };
            case "0xfded065d61215141ea7afac2e5c1a7b23514a91cbb2cfd86a38ed97e2f7871ac::PEPE::PEPE":
                return {
                    symbol: "PEPE",
                    decimals: 9,
                };
            case "0xd01cebc27fe22868df462f33603646549e13a4b279f5e900b99b9843680445e1::SHIBA::SHIBA":
                return {
                    symbol: "SHIBA",
                    decimals: 9,
                };
        }
    })
}));

describe("sui wallet tests", () => {
    let logger: winston.Logger;
    let options: SuiWalletOptions;
    beforeAll(() => {
        const _logger = {
            debug: jest.fn(),
        };

        jest.mock("winston", () => ({
            createLogger: jest.fn().mockReturnValue(_logger),
            transports: {
                Console: jest.fn()
            }
        }));

        options = {
            logger,
            nodeUrl: "",
        };
    })
    test("Pull token balances", async () => {
        const wallets: WalletConfig[] = [
            {
                address: "0x0000000000000000000000000000000000000000000000000000000000000000",
                tokens: ["USDC", "PEPE", "SHIBA"],
            },
        ];
        const wallet = new SuiWalletToolbox(
            SUI_MAINNET,
            SUI,
            wallets,
            options
        );

        await wallet.warmup();
        expect(pullSuiTokenData).toHaveBeenCalled();

        const tokenBalances = await wallet.pullTokenBalances(
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            ["0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN"]
        );

        expect(tokenBalances).toStrictEqual([
            {
                "tokenAddress": "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
                "address": "0x0000000000000000000000000000000000000000000000000000000000000000",
                "isNative": false,
                "rawBalance": "100000000",
                "formattedBalance": "100.0",
                "symbol": "USDC",
            }
        ]);
    });
})