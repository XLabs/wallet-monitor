import { ethers } from 'ethers';

import { Balance } from '..';

import EVM_TOKEN_ABI from './erc20-abi.json';

function getTokenContract (
  provider: ethers.providers.JsonRpcProvider,
  tokenAddress: string,
): ethers.Contract {
  return new ethers.Contract(tokenAddress, EVM_TOKEN_ABI, provider);
}

export async function pullEvmTokenData(
  provider: ethers.providers.JsonRpcProvider,
  tokenAddress: string,
): Promise<EvmTokenData> {
  const contract = getTokenContract(provider, tokenAddress);

  const symbol = await contract.symbol();
  const decimals = await contract.decimals();

  return { symbol, decimals };
}

export async function pullEvmTokenBalance(
  provider: ethers.providers.JsonRpcProvider,
  tokenAddress: string,
  address: string,
): Promise<Balance> {
  const contract = getTokenContract(provider, tokenAddress);

  const balance = await contract.balanceOf(address);
  return {
    isNative: false,
    balanceAbsolute: balance.toString(),
  }
};

export async function pullEvmNativeBalance(
  provider: ethers.providers.JsonRpcProvider,
  address: string,
): Promise<Balance>{
  const weiAmount = await provider.getBalance(address);
  

  return {
    isNative: true,
    balanceAbsolute: weiAmount.toString(),
    
  }
}

export type EvmTokenData = {
  symbol: string;
  decimals: number;
};

