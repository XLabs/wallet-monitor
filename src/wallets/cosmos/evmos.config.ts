import { CosmosDefaultConfigs } from ".";

const EVMOS_MAINNET = "mainnet";
const EVMOS_TESTNET = "testnet";
const EVMOS_CURRENCY_SYMBOL = "EVMOS";
const EVMOS_NATIVE_DENOM = "aevmos";
const EVMOS_ADDRESS_PREFIX = "evmos";

const EVMOS_CURRENCY_SYMBOL_TESTNET = "TEVMOS";
const EVMOS_NATIVE_DENOM_TESTNET = "atevmos";
const EVMOS_DEFAULT_DECIMALS = 18;

// See: https://docs.evmos.org/protocol/modules/feemarket#parameters
const EVMOS_MIN_GAS_PRICE_MAINNET = "0aevmos";
const EVMOS_MIN_GAS_PRICE_TESTNET = "0atevmos";

export const EVMOS = "evmos";
export const EVMOS_NETWORKS = {
  [EVMOS_MAINNET]: 1,
  [EVMOS_TESTNET]: 2,
};

export const EVMOS_KNOWN_TOKENS = {
  [EVMOS_MAINNET]: {},
  [EVMOS_TESTNET]: {},
};

const EVMOS_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const EVMOS_DEFAULT_CONFIGS: CosmosDefaultConfigs = {
  [EVMOS_MAINNET]: {
    nodeUrl: "https://evmos-rpc.publicnode.com:443",
    tokenPollConcurrency: EVMOS_DEFAULT_TOKEN_POLL_CONCURRENCY,
    nativeDenom: EVMOS_NATIVE_DENOM,
    addressPrefix: EVMOS_ADDRESS_PREFIX,
    defaultDecimals: EVMOS_DEFAULT_DECIMALS,
    minGasPrice: EVMOS_MIN_GAS_PRICE_MAINNET,
  },
  [EVMOS_TESTNET]: {
    nodeUrl: "https://evmos-testnet-rpc.publicnode.com:443",
    tokenPollConcurrency: EVMOS_DEFAULT_TOKEN_POLL_CONCURRENCY,
    nativeDenom: EVMOS_NATIVE_DENOM_TESTNET,
    addressPrefix: EVMOS_ADDRESS_PREFIX,
    defaultDecimals: EVMOS_DEFAULT_DECIMALS,
    minGasPrice: EVMOS_MIN_GAS_PRICE_TESTNET,
  },
};

export const EVMOS_CHAIN_CONFIG = {
  chainName: EVMOS,
  networks: EVMOS_NETWORKS,
  knownTokens: EVMOS_KNOWN_TOKENS,
  defaultConfigs: EVMOS_DEFAULT_CONFIGS,
  nativeCurrencySymbol: EVMOS_CURRENCY_SYMBOL,
  defaultNetwork: EVMOS_MAINNET,
};

export type EvmosNetwork = keyof typeof EVMOS_NETWORKS;
