import { EvmDefaultConfigs } from ".";

export const BSC = 'bsc';

export const BSC_MAINNET = 'mainnet';

export const BSC_TESTNET = 'testnet';

export const BSC_NETWORKS = {
    [BSC_MAINNET]: 1,
    [BSC_TESTNET]: 2,
};

export const BSC_KNOWN_TOKENS = {
    [BSC_MAINNET]: {
        "USDC": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        "DAI": "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    },
    [BSC_TESTNET]: {
        "USDC": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        "DAI": "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    },
};

const BSC_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const BSC_DEFAULT_CONFIGS: EvmDefaultConfigs = {
    [BSC_MAINNET]: {
        nodeUrl: 'https://bsc-dataseed.binance.org',
        tokenPollConcurrency: BSC_DEFAULT_TOKEN_POLL_CONCURRENCY,
    },
    [BSC_TESTNET]: {
        nodeUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        tokenPollConcurrency: BSC_DEFAULT_TOKEN_POLL_CONCURRENCY,
    },
};

export const BSC_CHAIN_CONFIG = {
    chainName: BSC,
    nativeCurrencySymbol: 'BNB',
    knownTokens: BSC_KNOWN_TOKENS,
    networks: BSC_NETWORKS,
    defaultConfigs: BSC_DEFAULT_CONFIGS,
    defaultNetwork: BSC_MAINNET,
};

export type BscNetwork = keyof typeof BSC_NETWORKS;
