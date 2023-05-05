import { DEVNET } from '../index';
import { EvmDefaultConfigs } from './index';

const ETHEREUM_MAINNET = 'mainnet';
const ETHEREUM_RINKEBY = 'rinkeby';
const ETHEREUM_ROPSTEN = 'ropsten';
const ETHEREUM_GOERLI = 'goerli';
const ETHEREUM_CURRENCY_SYMBOL = 'ETH';

export const ETHEREUM = 'ethereum';

export const ETHEREUM_NETWORKS = {
  [DEVNET]: 1,
  [ETHEREUM_MAINNET]: 2,
  [ETHEREUM_RINKEBY]: 3,
  [ETHEREUM_ROPSTEN]: 4,
  [ETHEREUM_GOERLI]: 5,
};

export const ETHEREUM_KNOWN_TOKENS = {
  [ETHEREUM_MAINNET]: {
    "USDC": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "DAI": "0x6b175474e89094c44da98b954eedeac495271d0f",
  },
  [ETHEREUM_RINKEBY]: {
    "USDC": "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b",
    "DAI": "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
  },
  [ETHEREUM_ROPSTEN]: {
    "USDC": "0x07865c6e87b9f70255377e024ace6630c1eaa37f",
    "DAI": "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
  },
  [ETHEREUM_GOERLI]: {
    "USDC": "0x07865c6e87b9f70255377e024ace6630c1eaa37f",
    "DAI": "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
  },
  [DEVNET]: {},
}

const ETHEREUM_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const ETHEREUM_DEFAULT_CONFIGS: EvmDefaultConfigs = {
  [ETHEREUM_MAINNET]: {
    nodeUrl: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    tokenPollConcurrency: ETHEREUM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [ETHEREUM_RINKEBY]: {
    nodeUrl: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    tokenPollConcurrency: ETHEREUM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [ETHEREUM_ROPSTEN]: {
    nodeUrl: 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    tokenPollConcurrency: ETHEREUM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [ETHEREUM_GOERLI]: {
    nodeUrl: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    tokenPollConcurrency: ETHEREUM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [DEVNET]: {
    nodeUrl: 'http://localhost:8545',
    tokenPollConcurrency: ETHEREUM_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
}

export const ETHEREUM_CHAIN_CONFIG = {
  chainName: ETHEREUM,
  networks: ETHEREUM_NETWORKS,
  knownTokens: ETHEREUM_KNOWN_TOKENS,
  defaultConfigs: ETHEREUM_DEFAULT_CONFIGS,
  nativeCurrencySymbol: ETHEREUM_CURRENCY_SYMBOL,
  defaultNetwork: ETHEREUM_MAINNET
}

export type EthereumNetwork = keyof typeof ETHEREUM_NETWORKS;
// export type KnownEthereumTokens = keyof typeof ETHEREUM_KNOWN_TOKENS;
