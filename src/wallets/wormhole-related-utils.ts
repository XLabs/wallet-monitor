// this modules name (wormhole-related-utils) is a placeholder until we find its name
// For the moment I'll isolate here all code that uses wormhole-sdk constants.
// I don't see the point of duplicating the mapping for supported chains etc, at least for now.

import {
  EVMChainId,
  ChainName,
  isChain,
  EVMChainName,
  SolanaChainName,
  TerraChainName,
  isEVMChain as wormholeIsEVMChain,
  isTerraChain as wormholeIsTerraChain,
} from "@certusone/wormhole-sdk";

// The purpose of this indirection layer is so that we can easily replace the wormhole-sdk
export type KnownChainNames = ChainName;
export type EvmChainNames = EVMChainName;
export type EvmChainIds = EVMChainId;
export type SolanaChainNames = SolanaChainName;
export type terraChainNames = TerraChainName;

export function isEvmChain(chainName: string): chainName is EVMChainName {
  if (!isChain(chainName)) return false;
  if (!wormholeIsEVMChain(chainName)) return false;
  return true;
}

export function isSolanaChain(chainName: string): chainName is SolanaChainName {
  if (chainName === "solana") return true;
  return false;
}

export function isTerraChain(chainName: string): chainName is TerraChainName {
  if (!isChain(chainName)) return false;
  if (!wormholeIsTerraChain(chainName)) return false;
  return true;
};
