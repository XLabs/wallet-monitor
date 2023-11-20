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

  const [symbol, decimals] = await Promise.all([
    contract.symbol(),
    contract.decimals(),
  ]);

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
    rawBalance: balance.toString(),
  }
}

export async function pullEvmNativeBalance(
  provider: ethers.providers.JsonRpcProvider,
  address: string,
  blockHeight?: number,
): Promise<Balance>{
  const weiAmount = await provider.getBalance(address, blockHeight);

  return {
    isNative: true,
    rawBalance: weiAmount.toString(),
  }
}

export type EvmTransferTransactionDetails = {
  targetAddress: string;
  amount: number; // amount in highest denomination (e.g. ETH, not wei)
  maxGasPrice?: number;
  gasLimit?: number;
}

export async function transferEvmNativeBalance(
  provider: ethers.providers.JsonRpcProvider,
  privateKey: string,
  txDetails: EvmTransferTransactionDetails
) {

  const { targetAddress, amount, maxGasPrice, gasLimit } = txDetails;

  const wallet = new ethers.Wallet(privateKey, provider);

  const amountInWei = ethers.utils.parseEther(amount.toString());

  const transaction = {
    to: targetAddress,
    value: amountInWei,
    gasLimit: gasLimit,
    gasPrice: maxGasPrice ? ethers.utils.parseUnits(maxGasPrice!.toString(), 'gwei') : undefined,
  };


  if (maxGasPrice) {
    transaction.gasPrice = ethers.utils.parseUnits(maxGasPrice.toString(), 'gwei');
  }

  if (gasLimit) {
    transaction.gasLimit = gasLimit;
  }

  const txResponse = await wallet.sendTransaction(transaction);

  const txReceipt: ethers.providers.TransactionReceipt = await txResponse.wait();

  return {
    transactionHash: txReceipt.transactionHash,
    gasUsed: txReceipt.gasUsed.toString(),
    gasPrice: txReceipt.effectiveGasPrice.toString(),
    formattedCost: ethers.utils.formatEther(txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice)),
  }
}

export type EvmTokenData = {
  symbol: string;
  decimals: number;
};

export function getEvmAddressFromPrivateKey(privateKey: string): string {
  let wallet;

  try {
    wallet = new ethers.Wallet(privateKey);
  } catch(e) {
    throw new Error(`Invalid private key: ${e}`);
  }

  return wallet.address;
}

