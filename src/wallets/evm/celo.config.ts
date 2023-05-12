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
  [CELO_MAINNET]: {
    "WETH": "0x66803FB87aBd4aaC3cbB3fAd7C3aa01f6F3FB207",
    "USDC": "0x37f750B7cC259A2f741AF45294f6a16572CF5cAd",
    "USDT": "0x617f3112bf5397D0467D315cC709EF968D9ba546",
    "WBTC": "0xd71Ffd0940c920786eC4DbB5A12306669b5b81EF",
    "WBNB": "0xBf2554ce8A4D1351AFeB1aC3E5545AaF7591042d",
    "WMATIC": "0x9C234706292b1144133ED509ccc5B3CD193BF712",
    "WAVAX": "0xFFdb274b4909fC2efE26C8e4Ddc9fe91963cAA4d",
    "WFTM": "0xd1A342eE2210238233a347FEd61EE7Faf9f251ce",
    "WCELO": "0x471ece3750da237f93b8e339c536989b8978a438",
    "WGLMR": "0x383A5513AbE4Fe36e0E00d484F710148E348Aa9D",
    "WSUI": "0x1Cb9859B1A16A67ef83A0c7b9A21eeC17d9a97Dc",
  },
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
