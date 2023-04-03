export const AVALANCHE = 'avalanche';

const AVALANCHE_MAINNET = 'mainnet';
const AVALANCHE_TESTNET = 'testnet';



export const AVALANCHE_NETWORKS = {
  [AVALANCHE_MAINNET]: 1,
  [AVALANCHE_TESTNET]: 2,
};

export const AVALANCHE_KNOWN_TOKENS = {
  [AVALANCHE_MAINNET]: {
    "USDC": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    "DAI": "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
  },
  [AVALANCHE_TESTNET]: {
    "USDC": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    "DAI": "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
  },
}

export const AVALANCHE_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const AVALANCHE_DEFAULT_CONFIGS = {
  [AVALANCHE_MAINNET]: {
    nodeUrl: 'https://api.avax.network/ext/bc/C/rpc',
    tokenPollConcurrency: AVALANCHE_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [AVALANCHE_TESTNET]: {
    nodeUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    tokenPollConcurrency: AVALANCHE_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
};


export const AVALANCHE_CHAIN_CONFIG = {
  chainName: AVALANCHE,
  nativeCurrencySymbol: 'avax',
  knownTokens: AVALANCHE_KNOWN_TOKENS,
  networks: AVALANCHE_NETWORKS,
  defaultConfigs: {},
  defaultNetwork: AVALANCHE_MAINNET,
};

export type AvalancheNetwork = keyof typeof AVALANCHE_NETWORKS;
