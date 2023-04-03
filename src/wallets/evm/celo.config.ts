import { EvmDefaultConfigs } from './index';

const CELO = 'celo';

const CELO_MAINNET = 'mainnet';
const CELO_ALFAJORES = 'alfajores';

const CELO_NETWORKS = {
    [CELO_MAINNET]: 1,
    [CELO_ALFAJORES]: 2,
};

export const CELO_KNOWN_TOKENS = {
    [CELO_MAINNET]: {
        "USDC": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        "DAI": "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    },
    [CELO_ALFAJORES]: {
        "USDC": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        "DAI": "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    },
};

const CELO_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const CELO_DEFAULT_CONFIGS: EvmDefaultConfigs = {
    [CELO_MAINNET]: {
        nodeUrl: 'https://forno.celo.org',
        tokenPollConcurrency: CELO_DEFAULT_TOKEN_POLL_CONCURRENCY,
    },
    [CELO_ALFAJORES]: {
        nodeUrl: 'https://rc1-forno.celo-testnet.org',
        tokenPollConcurrency: CELO_DEFAULT_TOKEN_POLL_CONCURRENCY,
    },
};

export const CELO_CHAIN_CONFIG = {
    chainName: CELO,
    networks: CELO_NETWORKS,
    knownTokens: CELO_KNOWN_TOKENS,
    defaultConfigs: CELO_DEFAULT_CONFIGS,
    nativeCurrencySymbol: 'CELO',
    defaultNetwork: CELO_MAINNET,
};

export type CeloNetwork = keyof typeof CELO_NETWORKS;