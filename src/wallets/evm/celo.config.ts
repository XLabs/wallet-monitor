import { DEVNET } from '../index';
import { EvmDefaultConfigs } from "./index";

export const CELO = "celo";

const CELO_MAINNET = "mainnet";
const CELO_ALFAJORES = "alfajores";

const CELO_NETWORKS = {
  [DEVNET]: 1,
  [CELO_MAINNET]: 2,
  [CELO_ALFAJORES]: 3,
};

export const CELO_KNOWN_TOKENS = {
  [CELO_MAINNET]: {},
  [CELO_ALFAJORES]: {},
};

const CELO_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const CELO_DEFAULT_CONFIGS: EvmDefaultConfigs = {
  [CELO_MAINNET]: {
    nodeUrl: "https://forno.celo.org",
    tokenPollConcurrency: CELO_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [CELO_ALFAJORES]: {
    nodeUrl: "https://alfajores-forno.celo-testnet.org",
    tokenPollConcurrency: CELO_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
};

export const CELO_CHAIN_CONFIG = {
  chainName: CELO,
  networks: CELO_NETWORKS,
  knownTokens: CELO_KNOWN_TOKENS,
  defaultConfigs: CELO_DEFAULT_CONFIGS,
  nativeCurrencySymbol: "CELO",
  defaultNetwork: CELO_MAINNET,
};

export type CeloNetwork = keyof typeof CELO_NETWORKS;
