export declare enum Environment {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  DEVNET = "devnet",
}

export type CoinGeckoIds =
  | "solana"
  | "ethereum"
  | "binancecoin"
  | "matic-network"
  | "avalanche-2"
  | "fantom"
  | "celo"
  | "moonbeam"
  | "dai"
  | "usd-coin"
  | "tether"
  | "wrapped-bitcoin"
  | "sui";

export interface TokenInfo {
  chainId: number;
  coingeckoId: CoinGeckoIds;
  symbol: string;
  tokenContract: string;
}

const mainnetTokens = [
  {
    chainId: 2,
    coingeckoId: "ethereum",
    symbol: "WETH",
    tokenContract:
      "000000000000000000000000C02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  {
    chainId: 2,
    coingeckoId: "dai",
    symbol: "WDAI",
    tokenContract:
      "0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f",
  },
  {
    chainId: 2,
    coingeckoId: "usd-coin",
    symbol: "WUSDC",
    tokenContract:
      "000000000000000000000000A0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  {
    chainId: 2,
    coingeckoId: "tether",
    symbol: "WUSDT",
    tokenContract:
      "000000000000000000000000dAC17F958D2ee523a2206206994597C13D831ec7",
  },
  {
    chainId: 2,
    coingeckoId: "wrapped-bitcoin",
    symbol: "WBTC",
    tokenContract:
      "0000000000000000000000002260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  },
  {
    chainId: 4,
    coingeckoId: "binancecoin",
    symbol: "WBNB",
    tokenContract:
      "000000000000000000000000bb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  },
  {
    chainId: 5,
    coingeckoId: "matic-network",
    symbol: "WMATIC",
    tokenContract:
      "0000000000000000000000000d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  },
  {
    chainId: 6,
    coingeckoId: "avalanche-2",
    symbol: "WAVAX",
    tokenContract:
      "000000000000000000000000B31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  },
  {
    chainId: 10,
    coingeckoId: "fantom",
    symbol: "WFTM",
    tokenContract:
      "00000000000000000000000021be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
  },
  {
    chainId: 14,
    coingeckoId: "celo",
    symbol: "WCELO",
    tokenContract:
      "000000000000000000000000471EcE3750Da237f93B8E339c536989b8978a438",
  },
  {
    chainId: 16,
    coingeckoId: "moonbeam",
    symbol: "WGLMR",
    tokenContract:
      "000000000000000000000000Acc15dC74880C9944775448304B263D191c6077F",
  },
  {
    chainId: 21,
    coingeckoId: "sui",
    symbol: "WSUI",
    tokenContract:
      "9258181f5ceac8dbffb7030890243caed69a9599d2886d957a9cb7656af3bdb3",
  },
] satisfies TokenInfo[];

const testnetTokens = [
  {
    chainId: 2,
    coingeckoId: "dai",
    symbol: "DAI",
    tokenContract:
      "00000000000000000000000011fE4B6AE13d2a6055C8D9cF65c55bac32B5d844",
  },
  {
    chainId: 2,
    coingeckoId: "ethereum",
    symbol: "ETH",
    tokenContract:
      "000000000000000000000000B4FBF271143F4FBf7B91A5ded31805e42b2208d6",
  },
  {
    chainId: 4,
    coingeckoId: "binancecoin",
    symbol: "BNB",
    tokenContract:
      "000000000000000000000000ae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
  },
  {
    chainId: 5,
    coingeckoId: "matic-network",
    symbol: "MATIC",
    tokenContract:
      "0000000000000000000000009c3C9283D3e44854697Cd22D3Faa240Cfb032889",
  },
  {
    chainId: 6,
    coingeckoId: "avalanche-2",
    symbol: "AVAX",
    tokenContract:
      "000000000000000000000000d00ae08403B9bbb9124bB305C09058E32C39A48c",
  },
  {
    chainId: 6,
    coingeckoId: "usd-coin",
    symbol: "USDC",
    tokenContract:
      "0000000000000000000000005425890298aed601595a70AB815c96711a31Bc65",
  },
  {
    chainId: 10,
    coingeckoId: "fantom",
    symbol: "FTM",
    tokenContract:
      "000000000000000000000000f1277d1Ed8AD466beddF92ef448A132661956621",
  },
  {
    chainId: 14,
    coingeckoId: "celo",
    symbol: "CELO",
    tokenContract:
      "000000000000000000000000F194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9",
  },
  {
    chainId: 16,
    coingeckoId: "moonbeam",
    symbol: "GLMR",
    tokenContract:
      "000000000000000000000000D909178CC99d318e4D46e7E66a972955859670E1",
  },
  {
    chainId: 21,
    coingeckoId: "sui",
    symbol: "SUI",
    tokenContract:
      "9d31091f5decefeb373de2218d634dbe198c72feac6e50fba0a5330cb5e65cff",
  },
] satisfies TokenInfo[];

export const supportedTokensByEnv: Record<Environment, TokenInfo[]> = {
  [Environment.MAINNET]: mainnetTokens,
  [Environment.TESTNET]: testnetTokens,
  [Environment.DEVNET]: [],
};
