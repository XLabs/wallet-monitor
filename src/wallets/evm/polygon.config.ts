import { EvmDefaultConfigs } from './index';

export const POLYGON = 'polygon';

export const POLYGON_MAINNET = 'mainnet';

export const POLYGON_MUMBAI = 'mumbai';

export const POLYGON_HEIMDALL = 'heimdall';

export const POLYGON_BOR = 'bor';

export const POLYGON_NETWORKS = {
  [POLYGON_MAINNET]: 1,
  [POLYGON_MUMBAI]: 2,
};

export const POLYGON_KNOWN_TOKENS = {
  [POLYGON_MAINNET]: {
    "WETH": "0x11CD37bb86F65419713f30673A480EA33c826872",
    "USDC": "0x4318CB63A2b8edf2De971E2F17F77097e499459D",
    "USDT": "0x9417669fbf23357d2774e9d421307bd5ea1006d2",
    "WBTC": "0x5d49c278340655b56609fdf8976eb0612af3a0c3",
    "WBNB": "0xeCDCB5B88F8e3C15f95c720C51c71c9E2080525d",
    "WMATIC": "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    "WAVAX": "0x7Bb11E7f8b10E9e571E5d8Eace04735fDFB2358a",
    "WFTM": "0x3726831304D77f585f1Aca9d9841cc3Ef80dAa62",
    "WCELO": "0x922F49a9911effc034eE756196E59BE7b90D43b3",
    "WGLMR": "0xcC48d6CF842083fEc0E01d913fB964b585975F05",
    "WSUI": "0x34bE049fEbfc6C64Ffd82Da08a8931A9a45f2cc8",
    "WARB": "0x33c788e1191d18ccd0b6db8176ead234ed22321a",
  },
  [POLYGON_MUMBAI]: {

  },
  [POLYGON_HEIMDALL]: {

  },
  [POLYGON_BOR]: {

  },
}

const POLYGON_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const POLYGON_DEFAULT_CONFIGS: EvmDefaultConfigs = {
  [POLYGON_MAINNET]: {
    nodeUrl: 'https://rpc-mainnet.maticvigil.com',
    tokenPollConcurrency: POLYGON_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [POLYGON_MUMBAI]: {
    nodeUrl: 'https://rpc-mumbai.maticvigil.com',
    tokenPollConcurrency: POLYGON_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [POLYGON_HEIMDALL]: {
    nodeUrl: 'https://rpc.heimdall.matic.today',
    tokenPollConcurrency: POLYGON_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [POLYGON_BOR]: {
    nodeUrl: 'https://rpc.bor.matic.today',
    tokenPollConcurrency: POLYGON_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
}

export const POLYGON_CHAIN_CONFIG = {
  chainName: POLYGON,
  nativeCurrencySymbol: 'MATIC',
  knownTokens: POLYGON_KNOWN_TOKENS,
  networks: POLYGON_NETWORKS,
  defaultConfigs: POLYGON_DEFAULT_CONFIGS,
  defaultNetwork: POLYGON_MAINNET,
};

export type PolygonNetwork = keyof typeof POLYGON_NETWORKS;
// export type KnownPolygonTokens = keyof typeof ETHEREUM_KNOWN_TOKENS;
