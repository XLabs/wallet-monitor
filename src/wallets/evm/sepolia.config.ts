import { DEVNET } from "../index";
import { EvmDefaultConfigs } from "./index";

const ETHEREUM_SEPOLIA = "sepolia";

const ETHEREUM_CURRENCY_SYMBOL = "ETH";

export const SEPOLIA = "sepolia";

export const SEPOLIA_NETWORKS = {
  [ETHEREUM_SEPOLIA]: 1,
};

export const SEPOLIA_KNOWN_TOKENS = {
  [ETHEREUM_SEPOLIA]: {},
};

const ETHEREUM_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const SEPOLIA_DEFAULT_CONFIGS: EvmDefaultConfigs = {
  [ETHEREUM_SEPOLIA]: {
    nodeUrl: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", // https://endpoints.omniatech.io/v1/eth/sepolia/public
    tokenPollConcurrency: ETHEREUM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
};

export const SEPOLIA_CHAIN_CONFIG = {
  chainName: SEPOLIA,
  knownTokens: SEPOLIA_KNOWN_TOKENS,
  defaultConfigs: SEPOLIA_DEFAULT_CONFIGS,
  nativeCurrencySymbol: ETHEREUM_CURRENCY_SYMBOL,
  defaultNetwork: ETHEREUM_SEPOLIA,
  networks: SEPOLIA_NETWORKS,
};

export type SepoliaNetwork = keyof typeof SEPOLIA_NETWORKS;
// export type KnownEthereumTokens = keyof typeof ETHEREUM_KNOWN_TOKENS;
