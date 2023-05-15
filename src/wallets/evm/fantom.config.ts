import { DEVNET } from '..';
import { EvmDefaultConfigs } from './index';

export const FANTOM = 'fantom';

export const FANTOM_MAINNET = 'mainnet';
export const FANTOM_TESTNET = 'testnet';

export const FANTOM_NETWORKS = {
  [DEVNET]: 1,
  [FANTOM_MAINNET]: 2,
  [FANTOM_TESTNET]: 3,
};

export const FANTOM_KNOWN_TOKENS = {
  [FANTOM_MAINNET]: {
    "WETH": "0x2A126f043BDEBe5A0A9841c51915E562D9B07289",
    "USDC": "0x2Ec752329c3EB419136ca5e4432Aa2CDb1eA23e6",
    "USDT": "0x14BCb86aEed6a74D3452550a25D37f1c30AA0A66",
    "WBTC": "0x87e9E225aD8a0755B9958fd95BE43DD6A91FF3A7",
    "WBNB": "0xc033551e05907Ddd643AE14b6D4a9CA72BfF509B",
    "WMATIC": "0xb88A6064B1F3FF5B9AE4A82fFD52560b0dF9FBD3",
    "WAVAX": "0x358CE030DC6116Cc296E8B9F002728e65459C146",
    "WFTM": "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    "WCELO": "0xF432490C6c96C9d3bF523a499a1CEaFd8208A373",
    "WGLMR": "0xBF227E92D6754EB4BFE26C40cb299ff2809Da45f",
    "WSUI": "0xC277423a21F6e32D886BF85Ef6cCB945d5D28347",
  },
  [FANTOM_TESTNET]: {
  },
  [DEVNET]: {},
};

const FANTOM_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const FANTOM_DEFAULT_CONFIGS: EvmDefaultConfigs = {
  [FANTOM_MAINNET]: {
    nodeUrl: 'https://rpcapi.fantom.network',
    tokenPollConcurrency: FANTOM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [FANTOM_TESTNET]: {
    nodeUrl: 'https://rpc.testnet.fantom.network',
    tokenPollConcurrency: FANTOM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [DEVNET]: {
    nodeUrl: 'http://localhost:8545',
    tokenPollConcurrency: FANTOM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
};

export const FANTOM_CHAIN_CONFIG = {
  chainName: FANTOM,
  networks: FANTOM_NETWORKS,
  knownTokens: FANTOM_KNOWN_TOKENS,
  defaultConfigs: FANTOM_DEFAULT_CONFIGS,
  nativeCurrencySymbol: 'FTM',
  defaultNetwork: FANTOM_MAINNET,
};

export type FantomNetwork = keyof typeof FANTOM_NETWORKS;