import { EvmDefaultConfigs } from './index';

export const FANTOM = 'fantom';

export const FANTOM_MAINNET = 'mainnet';
export const FANTOM_TESTNET = 'testnet';

export const FANTOM_NETWORKS = {
    [FANTOM_MAINNET]: 1,
    [FANTOM_TESTNET]: 2,
};

export const FANTOM_KNOWN_TOKENS = {
    [FANTOM_MAINNET]: {
        "USDC": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        "DAI": "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    },
    [FANTOM_TESTNET]: {
        "USDC": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        "DAI": "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    },
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