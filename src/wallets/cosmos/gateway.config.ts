import { CosmosDefaultConfigs } from ".";

const GATEWAY_MAINNET = "wormchain-mainnet-0";
const GATEWAY_TESTNET = "wormchain-testnet-0";
const GATEWAY_CURRENCY_SYMBOL = "WORM";
const GATEWAY_NATIVE_DENOM = "uworm";
const GATEWAY_ADDRESS_PREFIX = "wormhole";
const GATEWAY_DEFAULT_DECIMALS = 6;

const GATEWAY_MIN_GAS_PRICE = "0utest";

export const GATEWAY = "gateway";
export const GATEWAY_NETWORKS = {
  [GATEWAY_MAINNET]: 1,
  [GATEWAY_TESTNET]: 2,
};

export const GATEWAY_KNOWN_TOKENS = {
  [GATEWAY_MAINNET]: {},
  [GATEWAY_TESTNET]: {},
};

const GATEWAY_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const GATEWAY_DEFAULT_CONFIGS: CosmosDefaultConfigs = {
  [GATEWAY_MAINNET]: {
    nodeUrl: "https://wormchain-mainnet.jumpisolated.com:443",
    tokenPollConcurrency: GATEWAY_DEFAULT_TOKEN_POLL_CONCURRENCY,
    nativeDenom: GATEWAY_NATIVE_DENOM,
    addressPrefix: GATEWAY_ADDRESS_PREFIX,
    defaultDecimals: GATEWAY_DEFAULT_DECIMALS,
    minGasPrice: GATEWAY_MIN_GAS_PRICE,
  },
  [GATEWAY_TESTNET]: {
    nodeUrl: "https://wormchain-testnet.jumpisolated.com:443",
    tokenPollConcurrency: GATEWAY_DEFAULT_TOKEN_POLL_CONCURRENCY,
    nativeDenom: GATEWAY_NATIVE_DENOM,
    addressPrefix: GATEWAY_ADDRESS_PREFIX,
    defaultDecimals: GATEWAY_DEFAULT_DECIMALS,
    minGasPrice: GATEWAY_MIN_GAS_PRICE,
  },
};

export const GATEWAY_CHAIN_CONFIG = {
  chainName: GATEWAY,
  networks: GATEWAY_NETWORKS,
  knownTokens: GATEWAY_KNOWN_TOKENS,
  defaultConfigs: GATEWAY_DEFAULT_CONFIGS,
  nativeCurrencySymbol: GATEWAY_CURRENCY_SYMBOL,
  defaultNetwork: GATEWAY_MAINNET,
};

export type GatewayNetwork = keyof typeof GATEWAY_NETWORKS;
