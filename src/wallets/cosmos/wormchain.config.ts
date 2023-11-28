import { CosmosDefaultConfigs } from ".";

const WORMCHAIN_MAINNET = "wormchain-mainnet-0";
const WORMCHAIN_TESTNET = "wormchain-testnet-0";
const WORMCHAIN_CURRENCY_SYMBOL = "WORM";
const WORMCHAIN_NATIVE_DENOM = "uworm";
const WORMCHAIN_ADDRESS_PREFIX = "wormhole";
const WORMCHAIN_DEFAULT_DECIMALS = 6;

const WORMCHAIN_MIN_GAS_PRICE = "0utest";

export const WORMCHAIN = "wormchain";
export const WORMCHAIN_NETWORKS = {
  [WORMCHAIN_MAINNET]: 1,
  [WORMCHAIN_TESTNET]: 2,
};

export const WORMCHAIN_KNOWN_TOKENS = {
  [WORMCHAIN_MAINNET]: {},
  [WORMCHAIN_TESTNET]: {},
};

const WORMCHAIN_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const WORMCHAIN_DEFAULT_CONFIGS: CosmosDefaultConfigs = {
  [WORMCHAIN_MAINNET]: {
    nodeUrl: "https://wormchain-mainnet.jumpisolated.com:443",
    tokenPollConcurrency: WORMCHAIN_DEFAULT_TOKEN_POLL_CONCURRENCY,
    nativeDenom: WORMCHAIN_NATIVE_DENOM,
    addressPrefix: WORMCHAIN_ADDRESS_PREFIX,
    defaultDecimals: WORMCHAIN_DEFAULT_DECIMALS,
    minGasPrice: WORMCHAIN_MIN_GAS_PRICE,
  },
  [WORMCHAIN_TESTNET]: {
    nodeUrl: "https://wormchain-testnet.jumpisolated.com:443",
    tokenPollConcurrency: WORMCHAIN_DEFAULT_TOKEN_POLL_CONCURRENCY,
    nativeDenom: WORMCHAIN_NATIVE_DENOM,
    addressPrefix: WORMCHAIN_ADDRESS_PREFIX,
    defaultDecimals: WORMCHAIN_DEFAULT_DECIMALS,
    minGasPrice: WORMCHAIN_MIN_GAS_PRICE,
  },
};

export const WORMCHAIN_CHAIN_CONFIG = {
  chainName: WORMCHAIN,
  networks: WORMCHAIN_NETWORKS,
  knownTokens: WORMCHAIN_KNOWN_TOKENS,
  defaultConfigs: WORMCHAIN_DEFAULT_CONFIGS,
  nativeCurrencySymbol: WORMCHAIN_CURRENCY_SYMBOL,
  defaultNetwork: WORMCHAIN_MAINNET,
};

export type WormchainNetwork = keyof typeof WORMCHAIN_NETWORKS;
