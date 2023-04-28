import { DEVNET } from '../';
import { EvmDefaultConfigs } from "./index";

export const MOONBEAM = "moonbeam";

const MOONBEAM_MAINNET = "moonbeam-mainnet";
const MOONBASE_ALPHA = "moonbase-alpha";

export const MOONBEAM_NETWORKS = {
  [DEVNET]: 1,
  [MOONBEAM_MAINNET]: 2,
  [MOONBASE_ALPHA]: 3,
};

export const MOONBEAM_KNOWN_TOKENS = {
  [MOONBEAM_MAINNET]: {
    USDC: "0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b",
    DAI: "0x765277eebeca2e31912c9946eae1021199b39c61",
  },
  [MOONBASE_ALPHA]: {},
  [DEVNET]: {},
};

const MOONBEAM_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const MOONBEAM_DEFAULT_CONFIGS: EvmDefaultConfigs = {
  [MOONBEAM_MAINNET]: {
    nodeUrl: "https://rpc.ankr.com/moonbeam",
    tokenPollConcurrency: MOONBEAM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [MOONBASE_ALPHA]: {
    nodeUrl: "https://rpc.testnet.moonbeam.network",
    tokenPollConcurrency: MOONBEAM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [DEVNET]: {
    nodeUrl: "http://localhost:8545",
    tokenPollConcurrency: MOONBEAM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
};

export const MOONBEAM_CHAIN_CONFIG = {
  chainName: MOONBEAM,
  networks: MOONBEAM_NETWORKS,
  knownTokens: MOONBEAM_KNOWN_TOKENS,
  defaultConfigs: MOONBEAM_DEFAULT_CONFIGS,
  nativeCurrencySymbol: "GLMR",
  defaultNetwork: MOONBEAM_MAINNET,
};

export type MoonbeamNetwork = keyof typeof MOONBEAM_NETWORKS;
