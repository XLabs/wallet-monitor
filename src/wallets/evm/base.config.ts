import { DEVNET } from "../index";
import { EvmDefaultConfigs } from "./index";

const BASE_MAINNET = "mainnet";
const BASE_GOERLI = "goerli";
const BASE_CURRENCY_SYMBOL = "ETH";

export const BASE = "base";

export const BASE_NETWORKS = {
  [DEVNET]: 1,
  [BASE_MAINNET]: 2,
  [BASE_GOERLI]: 3,
};

export const BASE_KNOWN_TOKENS = {
  [BASE_MAINNET]: {
    // WETH: "0x4200000000000000000000000000000000000006", // no WETH on base mainnet
    // USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // no USDC on base mainnet
    // USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", // no USDT on base mainnet
    // WBTC: "0x68f180fcCe6836688e9084f035309E29Bf0A2095", // no WBTC on base mainnet
    // WBNB: "0x418D75f65a02b3D53B2418FB8E1fe493759c7605", // no WBNB on base mainnet
    // WMATIC: "0x7c9f4C87d911613Fe9ca58b579f737911AAD2D43", // no WMATIC on base mainnet
    // WAVAX: "0x85f138bfEE4ef8e540890CFb48F620571d67Eda3", // no WAVAX on base mainnet
    // WFTM: "0x4cD2690d86284e044cb63E60F1EB218a825a7e92", // no WFTM on base mainnet
    // WCELO: "0x3294395e62f4eb6af3f1fcf89f5602d90fb3ef69", // no WCELO on base mainnet
    // WGLMR: "0x93d3696A9F879b331f40CB5059e37015423A3Bd0", // no WGLMR on base mainnet
    // WSUI: "0x84074EA631dEc7a4edcD5303d164D5dEa4c653D6", // no WSUI on base mainnet
    // WARB: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1", // no WARB on base mainnet
  },
  [BASE_GOERLI]: {
    // USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    // DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
  [DEVNET]: {},
};

const BASE_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const BASE_DEFAULT_CONFIGS: EvmDefaultConfigs = {
  [BASE_MAINNET]: {
    nodeUrl: "https://developer-access-mainnet.base.org",
    tokenPollConcurrency: BASE_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [BASE_GOERLI]: {
    nodeUrl: "https://goerli.base.org",
    tokenPollConcurrency: BASE_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [DEVNET]: {
    nodeUrl: "http://localhost:8545",
    tokenPollConcurrency: BASE_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
};

export const BASE_CHAIN_CONFIG = {
  chainName: BASE,
  networks: BASE_NETWORKS,
  knownTokens: BASE_KNOWN_TOKENS,
  defaultConfigs: BASE_DEFAULT_CONFIGS,
  nativeCurrencySymbol: BASE_CURRENCY_SYMBOL,
  defaultNetwork: BASE_MAINNET,
};

export type BaseNetwork = keyof typeof BASE_NETWORKS;
// export type KnownBaseTokens = keyof typeof BASE_KNOWN_TOKENS;
