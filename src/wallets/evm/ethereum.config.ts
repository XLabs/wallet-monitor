const ETHEREUM_MAINNET = 'mainnet';
const ETHEREUM_RINKEBY = 'rinkeby';
const ETHEREUM_ROPSTEN = 'ropsten';
const ETHEREUM_GOERLI = 'goerli';

export const ETHEREUM_NETWORKS = {
  [ETHEREUM_MAINNET]: 1,
  [ETHEREUM_RINKEBY]: 2,
  [ETHEREUM_ROPSTEN]: 3,
  [ETHEREUM_GOERLI]: 4,
};

export const ETHEREUM_KNOWN_TOKENS = {
  "USDC": {
    // TODO: This addresses were provided by copilot. Validate if they are correct
    [ETHEREUM_MAINNET]: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    [ETHEREUM_RINKEBY]: "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b",
    [ETHEREUM_ROPSTEN]: "0x07865c6e87b9f70255377e024ace6630c1eaa37f",
    [ETHEREUM_GOERLI]: "0x6b175474e89094c44da98b954eedeac495271d0f",
  },
  "DAI": {
    [ETHEREUM_MAINNET]: "0x6b175474e89094c44da98b954eedeac495271d0f",
    [ETHEREUM_RINKEBY]: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
    [ETHEREUM_ROPSTEN]: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
    [ETHEREUM_GOERLI]: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
  },
}

export const ETHEREUM_CHAIN_CONFIG = {
  nativeCurrencySymbol: 'ETH',
  networks: ETHEREUM_NETWORKS,
  knownTokens: ETHEREUM_KNOWN_TOKENS,
}

export type EthereumNetworks = keyof typeof ETHEREUM_NETWORKS;
export type KnownEthereumTokens = keyof typeof ETHEREUM_KNOWN_TOKENS;