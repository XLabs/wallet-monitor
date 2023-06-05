import { DEVNET } from '..';
import { EvmDefaultConfigs } from './index';

export const ARBITRUM = 'arbitrum';

export const ARBITRUM_MAINNET = 'Arbitrum';
export const ARBITRUM_TESTNET = 'Arbitrum Testnet';

export const ARBITRUM_NETWORKS = {
  [DEVNET]: 1,
  [ARBITRUM_MAINNET]: 2,
  [ARBITRUM_TESTNET]: 3,
};

export const ARBITRUM_KNOWN_TOKENS = {
  [ARBITRUM_MAINNET]: {
    "ARB": "0x912CE59144191C1204E64559FE8253a0e49E6548",
    "WETH": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    "USDC": "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
    "USDT": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
    "WBTC": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
    "WBNB": "0x8579794b10f88ebbedd3605f2e5ff54f162d4788",
    "WMATIC": "0x3ab0e28c3f56616ad7061b4db38ae337e3809aea",
    "WAVAX": "0x565609faf65b92f7be02468acf86f8979423e514",
    "WGLMR": "0x944c5b67a03e6cb93ae1e4b70081f13b04cdb6bd",
    "WSUI": "0xfe7b5a32c93dc25184d475e3083ba30ed3c1bf8f",
  },
  [ARBITRUM_TESTNET]: {
  },
  [DEVNET]: {},
};

const ARBITRUM_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const ARBITRUM_DEFAULT_CONFIGS: EvmDefaultConfigs = {
  [ARBITRUM_MAINNET]: {
    nodeUrl: 'https://arb1.arbitrum.io/rpc',
    tokenPollConcurrency: ARBITRUM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [ARBITRUM_TESTNET]: {
    nodeUrl: 'https://goerli-rollup.arbitrum.io/rpc',
    tokenPollConcurrency: ARBITRUM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },

  [DEVNET]: {
    nodeUrl: 'http://localhost:8545',
    tokenPollConcurrency: ARBITRUM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
};

export const ARBITRUM_CHAIN_CONFIG = {
  chainName: ARBITRUM,
  networks: ARBITRUM_NETWORKS,
  knownTokens: ARBITRUM_KNOWN_TOKENS,
  defaultConfigs: ARBITRUM_DEFAULT_CONFIGS,
  nativeCurrencySymbol: 'ETH',
  defaultNetwork: ARBITRUM_MAINNET,
};

export type ArbitrumNetwork = keyof typeof ARBITRUM_NETWORKS;