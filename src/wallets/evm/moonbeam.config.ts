import { EvmDefaultConfigs } from "./index";

export const MOONBEAM = "moonbeam";

const MOONBEAM_MAINNET = "mainnet";
const MOONBASE_ALPHA = "moonbase-alpha";

export const MOONBEAM_NETWORKS = {
    [MOONBEAM_MAINNET]: 1,
    [MOONBASE_ALPHA]: 2,
};

export const MOONBEAM_KNOWN_TOKENS = {
    [MOONBEAM_MAINNET]: {
        "USDC": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        "DAI": "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    },
    [MOONBASE_ALPHA]: {
        "USDC": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        "DAI": "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    },
};

const MOONBEAM_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const MOONBEAM_DEFAULT_CONFIGS: EvmDefaultConfigs = {
    [MOONBEAM_MAINNET]: {
        nodeUrl: "https://rpc.moonbeam.network",
        tokenPollConcurrency: MOONBEAM_DEFAULT_TOKEN_POLL_CONCURRENCY,
    },
    [MOONBASE_ALPHA]: {
        nodeUrl: "https://rpc.testnet.moonbeam.network",
        tokenPollConcurrency: MOONBEAM_DEFAULT_TOKEN_POLL_CONCURRENCY,
    },
};


export const MOONBEAM_CHAIN_CONFIG = {
    chainName: MOONBEAM,
    networks: MOONBEAM_NETWORKS,
    knownTokens: MOONBEAM_KNOWN_TOKENS,
    defaultConfigs: MOONBEAM_DEFAULT_CONFIGS,
    nativeCurrencySymbol: "GLMR",
    defaultNetwork: MOONBEAM_MAINNET,
};

export type MoonbeamNetwork = keyof typeof MOONBEAM_NETWORKS;