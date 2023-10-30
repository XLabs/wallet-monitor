import { DEVNET } from "../";
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
    WETH: "0xab3f0245B83feB11d15AAffeFD7AD465a59817eD",
    USDC: "0x931715FEE2d06333043d11F658C8CE934aC61D0c",
    USDT: "0xc30E9cA94CF52f3Bf5692aaCF81353a27052c46f",
    WBTC: "0xE57eBd2d67B462E9926e04a8e33f01cD0D64346D",
    WBNB: "0xE3b841C3f96e647E6dc01b468d6D0AD3562a9eeb",
    WMATIC: "0x82DbDa803bb52434B1f4F41A6F0Acb1242A7dFa3",
    WAVAX: "0xd4937A95BeC789CC1AE1640714C61c160279B22F",
    WFTM: "0x609AedD990bf45926bca9E4eE988b4Fb98587D3A",
    WCELO: "0xc1a792041985F65c17Eb65E66E254DC879CF380b",
    WGLMR: "0xacc15dc74880c9944775448304b263d191c6077f",
    WSUI: "0x484eCCE6775143D3335Ed2C7bCB22151C53B9F49",
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
