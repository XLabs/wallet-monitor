import { DEVNET } from '..';
import { EvmDefaultConfigs } from ".";

export const BSC = 'bsc';

export const BSC_MAINNET = 'mainnet';

export const BSC_TESTNET = 'testnet';

export const BSC_NETWORKS = {
    [DEVNET]: 1,
    [BSC_MAINNET]: 2,
    [BSC_TESTNET]: 3,
};

export const BSC_KNOWN_TOKENS = {
    [BSC_MAINNET]: {
        "USDC": "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        "DAI": "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
    },
    [BSC_TESTNET]: {},
    [DEVNET]: {},
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
    [DEVNET]: {
        nodeUrl: 'https://localhost:8545',
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
