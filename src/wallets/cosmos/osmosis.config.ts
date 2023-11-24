import { CosmosDefaultConfigs } from ".";

const OSMOSIS_MAINNET = "mainnet";
const OSMOSIS_TESTNET = "testnet";
const OSMOSIS_CURRENCY_SYMBOL = "OSMO";
const OSMOSIS_NATIVE_DENOM = "uosmo";
const OSMOSIS_ADDRESS_PREFIX = "osmo";
const OSMOSIS_DEFAULT_DECIMALS = 6;
const OSMOSIS_MIN_GAS_PRICE = "0.0025uosmo";

export const OSMOSIS = "osmosis";
export const OSMOSIS_NETWORKS = {
  [OSMOSIS_MAINNET]: 1,
  [OSMOSIS_TESTNET]: 2,
};

export const OSMOSIS_KNOWN_TOKENS = {
  [OSMOSIS_MAINNET]: {},
  [OSMOSIS_TESTNET]: {},
};

const OSMOSIS_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const OSMOSIS_DEFAULT_CONFIGS: CosmosDefaultConfigs = {
  [OSMOSIS_MAINNET]: {
    nodeUrl: "https://rpc.osmosis.zone",
    tokenPollConcurrency: OSMOSIS_DEFAULT_TOKEN_POLL_CONCURRENCY,
    nativeDenom: OSMOSIS_NATIVE_DENOM,
    addressPrefix: OSMOSIS_ADDRESS_PREFIX,
    defaultDecimals: OSMOSIS_DEFAULT_DECIMALS,
    minGasPrice: OSMOSIS_MIN_GAS_PRICE,
  },
  [OSMOSIS_TESTNET]: {
    nodeUrl: "https://rpc.testnet.osmosis.zone",
    tokenPollConcurrency: OSMOSIS_DEFAULT_TOKEN_POLL_CONCURRENCY,
    nativeDenom: OSMOSIS_NATIVE_DENOM,
    addressPrefix: OSMOSIS_ADDRESS_PREFIX,
    defaultDecimals: OSMOSIS_DEFAULT_DECIMALS,
    minGasPrice: OSMOSIS_MIN_GAS_PRICE,
  },
};

export const OSMOSIS_CHAIN_CONFIG = {
  chainName: OSMOSIS,
  networks: OSMOSIS_NETWORKS,
  knownTokens: OSMOSIS_KNOWN_TOKENS,
  defaultConfigs: OSMOSIS_DEFAULT_CONFIGS,
  nativeCurrencySymbol: OSMOSIS_CURRENCY_SYMBOL,
  defaultNetwork: OSMOSIS_MAINNET,
};

export type OsmosisNetwork = keyof typeof OSMOSIS_NETWORKS;
