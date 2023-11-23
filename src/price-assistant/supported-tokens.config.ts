import { z } from "zod";
import { ChainName, Environment } from "../wallets";

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
  z.literal("arbitrum"),
  z.literal("optimism"),
  z.literal("klay-token"),
  z.literal("base"),
  z.literal("pyth-network")
]);

export type CoinGeckoIds = z.infer<typeof CoinGeckoIdsSchema>;

export interface TokenInfo {
  chainId: number;
  coingeckoId: CoinGeckoIds;
  symbol: string;
  tokenContract: string;
}

export const coinGeckoIdByChainName = {
  "solana": "solana",
  "ethereum": "ethereum",
  "bsc": "binancecoin",
  "polygon": "matic-network",
  "avalanche": "avalanche-2",
  "fantom": "fantom",
  "celo": "celo",
  "moonbeam": "moonbeam",
  "sui": "sui",
  "arbitrum": "arbitrum",
  "optimism": "optimism",
  "base": "base",
  "klaytn": "klay-token",
  "pythnet": "pyth-network"
} as const satisfies Record<ChainName, CoinGeckoIds>;

const mainnetTokens = [
  {
    chainId: 1,
    coingeckoId: "solana",
    symbol: "WSOL",
    tokenContract: "069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
  },
  {
    chainId: 2,
    coingeckoId: "ethereum",
    symbol: "WETH",
    tokenContract: "000000000000000000000000C02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  {
    chainId: 4,
    coingeckoId: "binancecoin",
    symbol: "WBNB",
    tokenContract: "000000000000000000000000bb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  },
  {
    chainId: 5,
    coingeckoId: "matic-network",
    symbol: "WMATIC",
    tokenContract: "0000000000000000000000000d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  },
  {
    chainId: 6,
    coingeckoId: "avalanche-2",
    symbol: "WAVAX",
    tokenContract: "000000000000000000000000B31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  },
  {
    chainId: 10,
    coingeckoId: "fantom",
    symbol: "WFTM",
    tokenContract: "00000000000000000000000021be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
  },
  {
    chainId: 13,
    coingeckoId: "klay-token",
    symbol: "WKLAY",
    tokenContract: "",
  },
  {
    chainId: 14,
    coingeckoId: "celo",
    symbol: "WCELO",
    tokenContract: "000000000000000000000000471EcE3750Da237f93B8E339c536989b8978a438",
  },
  {
    chainId: 16,
    coingeckoId: "moonbeam",
    symbol: "WGLMR",
    tokenContract: "000000000000000000000000Acc15dC74880C9944775448304B263D191c6077F",
  },
  {
    chainId: 21,
    coingeckoId: "sui",
    symbol: "WSUI",
    tokenContract: "9258181f5ceac8dbffb7030890243caed69a9599d2886d957a9cb7656af3bdb3",
  },
  {
    chainId: 23,
    coingeckoId: "arbitrum",
    symbol: "WARB",
    tokenContract: "0x912CE59144191C1204E64559FE8253a0e49E6548",
  },
  {
    chainId: 24,
    coingeckoId: "optimism",
    symbol: "WOP",
    tokenContract: "0x4200000000000000000000000000000000000042",
  },
  {
    chainId: 26,
    coingeckoId: "pyth-network",
    symbol: "WPYTH",
    tokenContract: "",
  },
  {
    chainId: 30,
    coingeckoId: "base",
    symbol: "WBASE",
    tokenContract: "0x07150e919B4De5fD6a63DE1F9384828396f25fDC",
  },
] satisfies TokenInfo[];

const testnetTokens = [
  {
    chainId: 1,
    coingeckoId: "solana",
    symbol: "SOL",
    tokenContract: "",
  },
  {
    chainId: 2,
    coingeckoId: "ethereum",
    symbol: "ETH",
    tokenContract: "000000000000000000000000B4FBF271143F4FBf7B91A5ded31805e42b2208d6",
  },
  {
    chainId: 4,
    coingeckoId: "binancecoin",
    symbol: "BNB",
    tokenContract: "000000000000000000000000ae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
  },
  {
    chainId: 5,
    coingeckoId: "matic-network",
    symbol: "MATIC",
    tokenContract: "0000000000000000000000009c3C9283D3e44854697Cd22D3Faa240Cfb032889",
  },
  {
    chainId: 6,
    coingeckoId: "avalanche-2",
    symbol: "AVAX",
    tokenContract: "000000000000000000000000d00ae08403B9bbb9124bB305C09058E32C39A48c",
  },
  {
    chainId: 10,
    coingeckoId: "fantom",
    symbol: "FTM",
    tokenContract: "000000000000000000000000f1277d1Ed8AD466beddF92ef448A132661956621",
  },
  {
    chainId: 13,
    coingeckoId: "klay-token",
    symbol: "KLAY",
    tokenContract: "",
  },
  {
    chainId: 14,
    coingeckoId: "celo",
    symbol: "CELO",
    tokenContract: "000000000000000000000000F194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9",
  },
  {
    chainId: 16,
    coingeckoId: "moonbeam",
    symbol: "GLMR",
    tokenContract: "000000000000000000000000D909178CC99d318e4D46e7E66a972955859670E1",
  },
  {
    chainId: 21,
    coingeckoId: "sui",
    symbol: "SUI",
    tokenContract: "587c29de216efd4219573e08a1f6964d4fa7cb714518c2c8a0f29abfa264327d",
  },
  {
    chainId: 23,
    coingeckoId: "arbitrum",
    symbol: "ARB",
    tokenContract: "0xF861378B543525ae0C47d33C90C954Dc774Ac1F9",
  },
  {
    chainId: 24,
    coingeckoId: "optimism",
    symbol: "OP",
    tokenContract: "0x4200000000000000000000000000000000000042",
  },
  {
    chainId: 26,
    coingeckoId: "pyth-network",
    symbol: "PYTH",
    tokenContract: "",
  },
  {
    chainId: 30,
    coingeckoId: "base",
    symbol: "BASE",
    tokenContract: "",
  },
] satisfies TokenInfo[];

export const supportedTokensByEnv: Record<Environment, TokenInfo[]> = {
  [Environment.MAINNET]: mainnetTokens,
  [Environment.TESTNET]: testnetTokens,
  [Environment.DEVNET]: [],
};