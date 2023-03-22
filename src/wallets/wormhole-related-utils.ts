// this modules name (wormhole-related-utils) is a placeholder until we find its name
// For the moment I'll isolate here all code that uses wormhole-sdk constants.
// I don't see the point of duplicating the mapping for supported chains etc, at least for now.

import {
  EVMChainId,
  ChainName,
  ChainId,
  EVMChainName,
  SolanaChainName,
  TerraChainName,
  isChain as wormholeIsChain,
  isEVMChain as wormholeIsEVMChain,
  isTerraChain as wormholeIsTerraChain,
  CHAINS,
} from "@certusone/wormhole-sdk";

// The purpose of this indirection layer is so that we can easily replace the wormhole-sdk
export type KnownChainNames = ChainName;
export type KnownChainIds = ChainId;
export type EvmChainNames = EVMChainName;
export type EvmChainIds = EVMChainId;
export type SolanaChainNames = SolanaChainName;
export type terraChainNames = TerraChainName;

export function isChain (chainName: string): chainName is KnownChainNames {
  return wormholeIsChain(chainName);
}

export function chainNameToWormholeId(chainName: KnownChainNames): KnownChainIds {
  return CHAINS[chainName];
}

export function isEvmChain(chainName: KnownChainNames): chainName is EVMChainName {
  if (!wormholeIsEVMChain(chainName)) return false;
  return true;
}

export function isSolanaChain(chainName: KnownChainNames): chainName is SolanaChainName {
  if (chainName === "solana") return true;
  return false;
}

export function isTerraChain(chainName: KnownChainNames): chainName is TerraChainName {
  if (!wormholeIsTerraChain(chainName)) return false;
  return true;
};
