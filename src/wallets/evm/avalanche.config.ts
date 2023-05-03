import { DEVNET } from "..";
export const AVALANCHE = "avalanche";

const AVALANCHE_MAINNET = "mainnet";
const AVALANCHE_TESTNET = "testnet";

export const AVALANCHE_NETWORKS = {
  [DEVNET]: 1,
  [AVALANCHE_MAINNET]: 2,
  [AVALANCHE_TESTNET]: 3,
};

export const AVALANCHE_KNOWN_TOKENS = {
  [AVALANCHE_MAINNET]: {
    USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    DAI: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
  },
  [AVALANCHE_TESTNET]: {},
  [DEVNET]: {},
};

export const AVALANCHE_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const AVALANCHE_DEFAULT_CONFIGS = {
  [AVALANCHE_MAINNET]: {
    nodeUrl: "https://api.avax.network/ext/bc/C/rpc",
    tokenPollConcurrency: AVALANCHE_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [AVALANCHE_TESTNET]: {
    nodeUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    tokenPollConcurrency: AVALANCHE_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [DEVNET]: {
    nodeUrl: "http://localhost:8545",
    tokenPollConcurrency: AVALANCHE_DEFAULT_TOKEN_POLL_CONCURRENCY,
  }
};

export const AVALANCHE_CHAIN_CONFIG = {
  chainName: AVALANCHE,
  nativeCurrencySymbol: "AVAX",
  knownTokens: AVALANCHE_KNOWN_TOKENS,
  networks: AVALANCHE_NETWORKS,
  defaultConfigs: AVALANCHE_DEFAULT_CONFIGS,
  defaultNetwork: AVALANCHE_MAINNET,
};

export type AvalancheNetwork = keyof typeof AVALANCHE_NETWORKS;
