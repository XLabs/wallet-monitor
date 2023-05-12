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
        "WETH": "0x4db5a66e937a9f4473fa95b1caf1d1e1d62e29ea",
        "USDC": "0xB04906e95AB5D797aDA81508115611fee694c2b3",
        "USDT": "0x524bC91Dc82d6b90EF29F76A3ECAaBAffFD490Bc",
        "WBTC": "0x43359676e1a3f9fbb5de095333f8e9c1b46dfa44",
        "WBNB": "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
        "WMATIC": "0xc836d8dC361E44DbE64c4862D55BA041F88Ddd39",
        "WAVAX": "0x96412902aa9aFf61E13f085e70D3152C6ef2a817",
        "WFTM": "0xbF8413EE8612E0E4f66Aa63B5ebE27f3C5883d47",
        "WCELO": "0x2A335e327a55b177f5B40132fEC5D7298aa0D7e6",
        "WGLMR": "0x1C063db3c621BF901FC6C1D03328b08b2F9bbfba",
        "WSUI": "0x8314f6Bf1B4dd8604A0fC33C84F9AF2fc07AABC8",
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
        nodeUrl: 'http://localhost:8545',
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
