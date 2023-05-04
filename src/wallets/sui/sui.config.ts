import { DEVNET } from "..";

export const SUI = 'sui';

const SUI_TESTNET = 'testnet';

const SUI_MAINNET = 'mainnet';

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
    nodeUrl: 'http://localhost:8545', // ??
  },
  [SUI_TESTNET]: {
    nodeUrl: 'https://fullnode.testnet.sui.io'
  },
  [SUI_MAINNET]: {
    nodeUrl: 'https://sui-mainnet-rpc.allthatnode.com',
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
