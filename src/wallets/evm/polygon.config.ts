import { DEVNET } from '../index';
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
    "USDC": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    "DAI": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
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
