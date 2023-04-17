import { DEVNET } from '..';
import { EvmDefaultConfigs } from './index';

export const FANTOM = 'fantom';

export const FANTOM_MAINNET = 'mainnet';
export const FANTOM_TESTNET = 'testnet';

export const FANTOM_NETWORKS = {
  [DEVNET]: 1,
  [FANTOM_MAINNET]: 2,
  [FANTOM_TESTNET]: 3,
};

export const FANTOM_KNOWN_TOKENS = {
  [FANTOM_MAINNET]: {
    "USDC": "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
    "DAI": "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
  },
  [FANTOM_TESTNET]: {
  },
  [DEVNET]: {},
};

const FANTOM_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const FANTOM_DEFAULT_CONFIGS: EvmDefaultConfigs = {
  [FANTOM_MAINNET]: {
    nodeUrl: 'https://rpcapi.fantom.network',
    tokenPollConcurrency: FANTOM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [FANTOM_TESTNET]: {
    nodeUrl: 'https://rpc.testnet.fantom.network',
    tokenPollConcurrency: FANTOM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [DEVNET]: {
    nodeUrl: 'https://localhost:8545',
    tokenPollConcurrency: FANTOM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
};

export const FANTOM_CHAIN_CONFIG = {
  chainName: FANTOM,
  networks: FANTOM_NETWORKS,
  knownTokens: FANTOM_KNOWN_TOKENS,
  defaultConfigs: FANTOM_DEFAULT_CONFIGS,
  nativeCurrencySymbol: 'FTM',
  defaultNetwork: FANTOM_MAINNET,
};

export type FantomNetwork = keyof typeof FANTOM_NETWORKS;