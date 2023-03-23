import { ethers } from 'ethers';
import { Balance } from '.';

export async function pullEvmNativeBalance(
  provider: ethers.providers.JsonRpcProvider,
  address: string,
): Promise<Balance>{
  const weiAmount = await provider.getBalance(address);
  const balanceinEth = ethers.utils.formatEther(weiAmount);

  return {
    isNative: true,
    balanceAbsolute: weiAmount.toString(),
    balanceFormatted: balanceinEth.toString(),
  }
}