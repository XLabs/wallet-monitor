import { DEVNET } from "../index";
import { EvmDefaultConfigs } from "./index";

const OPTIMISM_MAINNET = "mainnet";
const OPTIMISM_GOERLI = "goerli";
const OPTIMISM_CURRENCY_SYMBOL = "ETH";

export const OPTIMISM = "optimism";

export const OPTIMISM_NETWORKS = {
  [DEVNET]: 1,
  [OPTIMISM_MAINNET]: 2,
  [OPTIMISM_GOERLI]: 3,
};

export const OPTIMISM_KNOWN_TOKENS = {
  [OPTIMISM_MAINNET]: {
    WETH: "0x4200000000000000000000000000000000000006",
    USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    WBTC: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
    // WBNB: "0x418D75f65a02b3D53B2418FB8E1fe493759c7605", // no WBNB on optimism mainnet
    // WMATIC: "0x7c9f4C87d911613Fe9ca58b579f737911AAD2D43", // no WMATIC on optimism mainnet
    // WAVAX: "0x85f138bfEE4ef8e540890CFb48F620571d67Eda3", // no WAVAX on optimism mainnet
    // WFTM: "0x4cD2690d86284e044cb63E60F1EB218a825a7e92", // no WFTM on optimism mainnet
    // WCELO: "0x3294395e62f4eb6af3f1fcf89f5602d90fb3ef69", // no WCELO on optimism mainnet
    // WGLMR: "0x93d3696A9F879b331f40CB5059e37015423A3Bd0", // no WGLMR on optimism mainnet
    // WSUI: "0x84074EA631dEc7a4edcD5303d164D5dEa4c653D6", // no WSUI on optimism mainnet
    // WARB: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1", // no WARB on optimism mainnet
  },
  [OPTIMISM_GOERLI]: {
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
  [DEVNET]: {},
};

const OPTIMISM_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const OPTIMISM_DEFAULT_CONFIGS: EvmDefaultConfigs = {
  [OPTIMISM_MAINNET]: {
    nodeUrl: "https://optimism.publicnode.com",
    tokenPollConcurrency: OPTIMISM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [OPTIMISM_GOERLI]: {
    nodeUrl: "https://optimism-goerli.publicnode.com",
    tokenPollConcurrency: OPTIMISM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [DEVNET]: {
    nodeUrl: "http://localhost:8545",
    tokenPollConcurrency: OPTIMISM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
};

export const OPTIMISM_CHAIN_CONFIG = {
  chainName: OPTIMISM,
  networks: OPTIMISM_NETWORKS,
  knownTokens: OPTIMISM_KNOWN_TOKENS,
  defaultConfigs: OPTIMISM_DEFAULT_CONFIGS,
  nativeCurrencySymbol: OPTIMISM_CURRENCY_SYMBOL,
  defaultNetwork: OPTIMISM_MAINNET,
};

export type OptimismNetwork = keyof typeof OPTIMISM_NETWORKS;
// export type KnownOptimismTokens = keyof typeof OPTIMISM_KNOWN_TOKENS;
