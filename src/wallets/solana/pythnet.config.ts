import { DEVNET } from "../index";

export const PYTHNET = "pythnet";

// TODO: reference this page to add a full list of networks.
export const PYTHNET_MAINNET = "mainnet-beta";
export const PYTHNET_NETWORKS = {
  [DEVNET]: 1,
  [PYTHNET_MAINNET]: 2,
};

export const PYTHNET_KNOWN_TOKENS = {
  [PYTHNET_MAINNET]: {},
  [DEVNET]: {},
};

export const PYTHNET_CHAIN_CONFIG = {
  chainName: PYTHNET,
  nativeCurrencySymbol: "PGAS",
  knownTokens: PYTHNET_KNOWN_TOKENS,
  networks: PYTHNET_NETWORKS,
  defaultNetwork: PYTHNET_MAINNET,
  defaultConfigs: {},
};
