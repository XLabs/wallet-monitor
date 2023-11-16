import { CosmosDefaultConfigs } from ".";

const COSMOSHUB_MAINNET = "mainnet";
const COSMOSHUB_TESTNET = "testnet";
const COSMOSHUB_CURRENCY_SYMBOL = "ATOM";
const COSMOSHUB_NATIVE_DENOM = "uatom";
const COSMOSHUB_ADDRESS_PREFIX = "cosmos";
const COSMOSHUB_DEFAULT_DECIMALS = 6;

export const COSMOSHUB = "cosmoshub";
export const COSMOSHUB_NETWORKS = {
  [COSMOSHUB_MAINNET]: 1,
  [COSMOSHUB_TESTNET]: 2,
};

export const COSMOSHUB_KNOWN_TOKENS = {
  [COSMOSHUB_MAINNET]: {},
  [COSMOSHUB_TESTNET]: {},
};

const COSMOSHUB_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const COSMOSHUB_DEFAULT_CONFIGS: CosmosDefaultConfigs = {
  [COSMOSHUB_MAINNET]: {
    nodeUrl: "https://cosmos-rpc.publicnode.com:443",
    tokenPollConcurrency: COSMOSHUB_DEFAULT_TOKEN_POLL_CONCURRENCY,
    nativeDenom: COSMOSHUB_NATIVE_DENOM,
    addressPrefix: COSMOSHUB_ADDRESS_PREFIX,
    defaultDecimals: COSMOSHUB_DEFAULT_DECIMALS,
  },
  [COSMOSHUB_TESTNET]: {
    nodeUrl: "https://cosmos-testnet-rpc.polkachu.com",
    tokenPollConcurrency: COSMOSHUB_DEFAULT_TOKEN_POLL_CONCURRENCY,
    nativeDenom: COSMOSHUB_NATIVE_DENOM,
    addressPrefix: COSMOSHUB_ADDRESS_PREFIX,
    defaultDecimals: COSMOSHUB_DEFAULT_DECIMALS,
  },
};

export const COSMOSHUB_CHAIN_CONFIG = {
  chainName: COSMOSHUB,
  networks: COSMOSHUB_NETWORKS,
  knownTokens: COSMOSHUB_KNOWN_TOKENS,
  defaultConfigs: COSMOSHUB_DEFAULT_CONFIGS,
  nativeCurrencySymbol: COSMOSHUB_CURRENCY_SYMBOL,
  defaultNetwork: COSMOSHUB_MAINNET,
};

export type CosmoshubNetwork = keyof typeof COSMOSHUB_NETWORKS;
