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
    "DAI": "0x6b1754740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa",
    "ETH": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
    "USDC": "0x5d36902b4567a1a9016e23835d723d7794d8429554084346c8908932e98b61a9",
    "ArbiNINJa": "0x956b903467154893c4611977303224098071601a9194497993929069931a5c54",
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