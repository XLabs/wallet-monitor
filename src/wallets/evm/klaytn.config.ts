import { DEVNET } from "../index";
import { EvmDefaultConfigs } from "./index";

const KLAYTN_MAINNET = "mainnet";
const KLAYTN_BAOBAB = "baobab";
const KLAYTN_CURRENCY_SYMBOL = "KLAY";

export const KLAYTN = "klaytn";

export const KLAYTN_NETWORKS = {
  [DEVNET]: 1,
  [KLAYTN_MAINNET]: 2,
  [KLAYTN_BAOBAB]: 3,
};

export const KLAYTN_KNOWN_TOKENS = {
  [KLAYTN_MAINNET]: {
    // WETH: "0x4200000000000000000000000000000000000006", // no WETH on klaytn mainnet
    // USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // no USDC on klaytn mainnet
    // USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", // no USDT on klaytn mainnet
    // WBTC: "0x68f180fcCe6836688e9084f035309E29Bf0A2095", // no WBTC on klaytn mainnet
    // WBNB: "0x418D75f65a02b3D53B2418FB8E1fe493759c7605", // no WBNB on klaytn mainnet
    // WMATIC: "0x7c9f4C87d911613Fe9ca58b579f737911AAD2D43", // no WMATIC on klaytn mainnet
    // WAVAX: "0x85f138bfEE4ef8e540890CFb48F620571d67Eda3", // no WAVAX on klaytn mainnet
    // WFTM: "0x4cD2690d86284e044cb63E60F1EB218a825a7e92", // no WFTM on klaytn mainnet
    // WCELO: "0x3294395e62f4eb6af3f1fcf89f5602d90fb3ef69", // no WCELO on klaytn mainnet
    // WGLMR: "0x93d3696A9F879b331f40CB5059e37015423A3Bd0", // no WGLMR on klaytn mainnet
    // WSUI: "0x84074EA631dEc7a4edcD5303d164D5dEa4c653D6", // no WSUI on klaytn mainnet
    // WARB: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1", // no WARB on klaytn mainnet
  },
  [KLAYTN_BAOBAB]: {
    // USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    // DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
  [DEVNET]: {},
};

const KLAYTN_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const KLAYTN_DEFAULT_CONFIGS: EvmDefaultConfigs = {
  [KLAYTN_MAINNET]: {
    nodeUrl: "https://klaytn.blockpi.network/v1/rpc/public",
    tokenPollConcurrency: KLAYTN_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [KLAYTN_BAOBAB]: {
    nodeUrl: "https://public-node-api.klaytnapi.com/v1/baobab	",
    tokenPollConcurrency: KLAYTN_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [DEVNET]: {
    nodeUrl: "http://localhost:8545",
    tokenPollConcurrency: KLAYTN_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
};

export const KLAYTN_CHAIN_CONFIG = {
  chainName: KLAYTN,
  networks: KLAYTN_NETWORKS,
  knownTokens: KLAYTN_KNOWN_TOKENS,
  defaultConfigs: KLAYTN_DEFAULT_CONFIGS,
  nativeCurrencySymbol: KLAYTN_CURRENCY_SYMBOL,
  defaultNetwork: KLAYTN_MAINNET,
};

export type KlaytnNetwork = keyof typeof KLAYTN_NETWORKS;
// export type KnownKlaytnTokens = keyof typeof KLAYTN_KNOWN_TOKENS;
