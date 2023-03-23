
const EVM_CHAINS = {
  ethereum: 10_000,
  polygon: 10_001,
  avalanche: 10_002,
};

const SOLANA_CHAINS = {
  solana: 20_000,
  pythnet: 20_001,
};

const TERRA_CHAINS = {
  terra: 30_000,
  terra2: 30_001,
};

export const KNOWN_CHAINS = {
  ...EVM_CHAINS,
  ...SOLANA_CHAINS,
  ...TERRA_CHAINS,
}

export type ChainName = keyof typeof KNOWN_CHAINS;
export type ChainId = typeof KNOWN_CHAINS[ChainName];

export type EVMChainName = keyof typeof EVM_CHAINS;
export type EVMChainId = typeof EVM_CHAINS[EVMChainName];

export type SolanaChainName = keyof typeof SOLANA_CHAINS;
export type SolanaChainId = typeof SOLANA_CHAINS[SolanaChainName];

export type TerraChainName = keyof typeof TERRA_CHAINS;
export type TerraChainId = typeof TERRA_CHAINS[TerraChainName];

export function isChain (chainName: string): chainName is ChainName {
  return chainName in KNOWN_CHAINS;
}

export function isEvmChain(chainName: ChainName): chainName is EVMChainName {
  return chainName in EVM_CHAINS;
}

export function isSolanaChain(chainName: ChainName): chainName is SolanaChainName {
  return chainName in SOLANA_CHAINS;
}

export function isTerraChain(chainName: ChainName): chainName is TerraChainName {
  return chainName in TERRA_CHAINS;
};

