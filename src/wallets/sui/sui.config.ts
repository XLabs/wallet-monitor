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
    "WETH": "0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN",
    "USDC": "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
    "USDT": "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
    "WBTC": "0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN",
    "WBNB": "0xb848cce11ef3a8f62eccea6eb5b35a12c4c2b1ee1af7755d02d7bd6218e8226f::coin::COIN",
    "WMATIC": "0xdbe380b13a6d0f5cdedd58de8f04625263f113b3f9db32b3e1983f49e2841676::coin::COIN",
    "WAVAX": "0x1e8b532cca6569cab9f9b9ebc73f8c13885012ade714729aa3b450e0339ac766::coin::COIN",
    "WFTM": "0x6081300950a4f1e2081580e919c210436a1bed49080502834950d31ee55a2396::coin::COIN",
    "WCELO": "0xa198f3be41cda8c07b3bf3fee02263526e535d682499806979a111e88a5a8d0f::coin::COIN",
    "WGLMR": "0x66f87084e49c38f76502d17f87d17f943f183bb94117561eb573e075fdc5ff75::coin::COIN",
    "SUI": "0x2::sui::SUI",
  },
  [SUI_TESTNET]: {},
};
export const SUI_CHAIN_CONFIG = {
  chainName: SUI,
  nativeCurrencySymbol: "SUI",
  knownTokens: SUI_KNOWN_TOKENS,
  defaultConfigs: SUI_DEFAULT_CONFIGS,
  networks: SUI_NETWORKS,
  defaultNetwork: SUI_TESTNET,
};
