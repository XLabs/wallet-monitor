const SOLANA_MAINNET = 'mainnet';
const SOLANA_DEVTNET = 'devnet';
const SOLANA_CURRENCY_SYMBOL = 'SOL';

export const SOLANA = 'solana';

export const SOLANA_NETWORKS = {
  [SOLANA_MAINNET]: 1,
  [SOLANA_DEVTNET]: 2,
}

export const SOLANA_KNOWN_TOKENS = {
  // TBD
  [SOLANA_MAINNET]: {},
  [SOLANA_DEVTNET]: {},
}

const SOLANA_DEFAULT_TOKEN_POLL_CONCURRENCY = 10;

export const SOLANA_DEFAULT_CONFIGS = {
  [SOLANA_MAINNET]: {
    nodeUrl: 'https://api.mainnet-beta.solana.com',
    tokenPollConcurrency: SOLANA_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
  [SOLANA_DEVTNET]: {
    nodeUrl: 'https://api.devnet.solana.com',
    tokenPollConcurrency: SOLANA_DEFAULT_TOKEN_POLL_CONCURRENCY,
  },
}

export const SOLANA_CHAIN_CONFIG = {
  chainName: SOLANA,
  networks: SOLANA_NETWORKS,
  knownTokens: SOLANA_KNOWN_TOKENS,
  defaultConfigs: SOLANA_DEFAULT_CONFIGS,
  nativeCurrencySymbol: SOLANA_CURRENCY_SYMBOL,
}

export type SolanaNetworks = keyof typeof SOLANA_NETWORKS;
export type KnownSolanaTokens = keyof typeof SOLANA_KNOWN_TOKENS;
