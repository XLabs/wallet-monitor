import { DEVNET } from "..";

export const SUI = 'sui';

const SUI_TESTNET = 'testnet';

export type SuiDefaultConfig = {
  nodeUrl: string;
};

export const SUI_NETWORKS = {
  [DEVNET]: 1,
  [SUI_TESTNET]: 2,
};

export type SuiDefaultConfigs = Record<string, SuiDefaultConfig>;

const SUI_DEFAULT_CONFIGS: SuiDefaultConfigs = {
  [DEVNET]: {
    nodeUrl: 'http://localhost:8545', // ??
  },
  [SUI_TESTNET]: {
    nodeUrl: 'https://fullnode.testnet.sui.io'
  }
};

export const SUI_CHAIN_CONFIG = {
  chainName: SUI,
  nativeCurrencySymbol: 'SUI',
  knownTokens: {},
  defaultConfigs: SUI_DEFAULT_CONFIGS,
  networks: SUI_NETWORKS,
  defaultNetwork: SUI_TESTNET,
};
