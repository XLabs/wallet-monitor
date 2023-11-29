import { CosmosDefaultConfigs } from ".";

const KUJIRA_MAINNET = "mainnet";
const KUJIRA_TESTNET = "testnet";
const KUJIRA_CURRENCY_SYMBOL = "KUJI";
const KUJIRA_NATIVE_DENOM = "ukuji";
const KUJIRA_ADDRESS_PREFIX = "kujira";
const KUJIRA_DEFAULT_DECIMALS = 6;

const KUJIRA_MIN_GAS_PRICE = "0.0075ukuji";

export const KUJIRA = "kujira";
export const KUJIRA_NETWORKS = {
  [KUJIRA_MAINNET]: 1,
  [KUJIRA_TESTNET]: 2,
};

export const KUJIRA_KNOWN_TOKENS = {
  [KUJIRA_MAINNET]: {},
  [KUJIRA_TESTNET]: {},
};

const KUJIRA_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const KUJIRA_DEFAULT_CONFIGS: CosmosDefaultConfigs = {
  [KUJIRA_MAINNET]: {
    nodeUrl: "https://kujira-rpc.publicnode.com:443",
    tokenPollConcurrency: KUJIRA_DEFAULT_TOKEN_POLL_CONCURRENCY,
    nativeDenom: KUJIRA_NATIVE_DENOM,
    addressPrefix: KUJIRA_ADDRESS_PREFIX,
    defaultDecimals: KUJIRA_DEFAULT_DECIMALS,
    minGasPrice: KUJIRA_MIN_GAS_PRICE,
  },
  [KUJIRA_TESTNET]: {
    nodeUrl: "https://kujira-testnet-rpc.polkachu.com",
    tokenPollConcurrency: KUJIRA_DEFAULT_TOKEN_POLL_CONCURRENCY,
    nativeDenom: KUJIRA_NATIVE_DENOM,
    addressPrefix: KUJIRA_ADDRESS_PREFIX,
    defaultDecimals: KUJIRA_DEFAULT_DECIMALS,
    minGasPrice: KUJIRA_MIN_GAS_PRICE,
  },
};

export const KUJIRA_CHAIN_CONFIG = {
  chainName: KUJIRA,
  networks: KUJIRA_NETWORKS,
  knownTokens: KUJIRA_KNOWN_TOKENS,
  defaultConfigs: KUJIRA_DEFAULT_CONFIGS,
  nativeCurrencySymbol: KUJIRA_CURRENCY_SYMBOL,
  defaultNetwork: KUJIRA_MAINNET,
};

export type KujiraNetwork = keyof typeof KUJIRA_NETWORKS;
