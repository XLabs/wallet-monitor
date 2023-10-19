import { z } from "zod";

export declare enum Environment {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  DEVNET = "devnet",
}

export const CoinGeckoIdsSchema = z
.union([
  z.literal("solana"),
  z.literal("ethereum"),
  z.literal("binancecoin"),
  z.literal("matic-network"),
  z.literal("avalanche-2"),
  z.literal("fantom"),
  z.literal("celo"),
  z.literal("moonbeam"),
  z.literal("dai"),
  z.literal("usd-coin"),
  z.literal("tether"),
  z.literal("wrapped-bitcoin"),
  z.literal("sui"),
]);

export type CoinGeckoIds = z.infer<typeof CoinGeckoIdsSchema>;
