import { DEVNET } from "..";

export const SUI = "sui";

const SUI_TESTNET = "testnet";

export const SUI_MAINNET = "mainnet";

export type SuiDefaultConfig = {
  nodeUrl: string;
};

export const SUI_NETWORKS = {
  [DEVNET]: 1,
  [SUI_TESTNET]: 2,
  [SUI_MAINNET]: 3,
};

export type SuiDefaultConfigs = Record<string, SuiDefaultConfig>;

const SUI_DEFAULT_CONFIGS: SuiDefaultConfigs = {
  [DEVNET]: {
    nodeUrl: "http://localhost:8545", // ??
  },
  [SUI_TESTNET]: {
    nodeUrl: "https://fullnode.testnet.sui.io",
  },
  [SUI_MAINNET]: {
    nodeUrl: "https://sui-mainnet-rpc.allthatnode.com",
  },
};

export const SUI_NATIVE_COIN_MODULE = "0x2::sui::SUI";

export const SUI_KNOWN_TOKENS = {
  [SUI_MAINNET]: {
    USDC: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
  },
};
export const SUI_CHAIN_CONFIG = {
  chainName: SUI,
  nativeCurrencySymbol: "SUI",
  knownTokens: SUI_KNOWN_TOKENS,
  defaultConfigs: SUI_DEFAULT_CONFIGS,
  networks: SUI_NETWORKS,
  defaultNetwork: SUI_TESTNET,
};
