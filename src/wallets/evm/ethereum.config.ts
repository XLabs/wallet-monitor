import { DEVNET } from "../index";
import { EvmDefaultConfigs } from "./index";

const ETHEREUM_MAINNET = "mainnet";
const ETHEREUM_RINKEBY = "rinkeby";
const ETHEREUM_ROPSTEN = "ropsten";
const ETHEREUM_GOERLI = "goerli";
const ETHEREUM_SEPOLIA = "sepolia";

const ETHEREUM_CURRENCY_SYMBOL = "ETH";

export const ETHEREUM = "ethereum";

export const ETHEREUM_NETWORKS = {
  [DEVNET]: 1,
  [ETHEREUM_MAINNET]: 2,
  [ETHEREUM_RINKEBY]: 3,
  [ETHEREUM_ROPSTEN]: 4,
  [ETHEREUM_GOERLI]: 5,
  [ETHEREUM_SEPOLIA]: 6,
};

export const ETHEREUM_KNOWN_TOKENS = {
  [ETHEREUM_MAINNET]: {
    WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    WBTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    WBNB: "0x418D75f65a02b3D53B2418FB8E1fe493759c7605",
    WMATIC: "0x7c9f4C87d911613Fe9ca58b579f737911AAD2D43",
    WAVAX: "0x85f138bfEE4ef8e540890CFb48F620571d67Eda3",
    WFTM: "0x4cD2690d86284e044cb63E60F1EB218a825a7e92",
    WCELO: "0x3294395e62f4eb6af3f1fcf89f5602d90fb3ef69",
    WGLMR: "0x93d3696A9F879b331f40CB5059e37015423A3Bd0",
    WSUI: "0x84074EA631dEc7a4edcD5303d164D5dEa4c653D6",
    WARB: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1",
  },
  [ETHEREUM_RINKEBY]: {
    USDC: "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b",
    DAI: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
  },
  [ETHEREUM_ROPSTEN]: {
    USDC: "0x07865c6e87b9f70255377e024ace6630c1eaa37f",
    DAI: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
  },
  [ETHEREUM_GOERLI]: {
    USDC: "0x07865c6e87b9f70255377e024ace6630c1eaa37f",
    DAI: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
  },
  [ETHEREUM_SEPOLIA]: {
    // USDC: "0x07865c6e87b9f70255377e024ace6630c1eaa37f", // Disable Sepolia's tokens
  },
  [DEVNET]: {
    ETH: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
  },
};

const ETHEREUM_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const ETHEREUM_DEFAULT_CONFIGS: EvmDefaultConfigs = {
  [ETHEREUM_MAINNET]: {
    nodeUrl: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    tokenPollConcurrency: ETHEREUM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [ETHEREUM_RINKEBY]: {
    nodeUrl: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    tokenPollConcurrency: ETHEREUM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [ETHEREUM_ROPSTEN]: {
    nodeUrl: "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    tokenPollConcurrency: ETHEREUM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [ETHEREUM_GOERLI]: {
    nodeUrl: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    tokenPollConcurrency: ETHEREUM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [ETHEREUM_SEPOLIA]: {
    nodeUrl: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", // https://endpoints.omniatech.io/v1/eth/sepolia/public
    tokenPollConcurrency: ETHEREUM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [DEVNET]: {
    nodeUrl: "http://127.0.0.1:8545",
    tokenPollConcurrency: ETHEREUM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
};

export const ETHEREUM_CHAIN_CONFIG = {
  chainName: ETHEREUM,
  networks: ETHEREUM_NETWORKS,
  knownTokens: ETHEREUM_KNOWN_TOKENS,
  defaultConfigs: ETHEREUM_DEFAULT_CONFIGS,
  nativeCurrencySymbol: ETHEREUM_CURRENCY_SYMBOL,
  defaultNetwork: ETHEREUM_MAINNET,
};

export type EthereumNetwork = keyof typeof ETHEREUM_NETWORKS;
// export type KnownEthereumTokens = keyof typeof ETHEREUM_KNOWN_TOKENS;
