import { Connection, JsonRpcProvider } from '@mysten/sui.js';
import { WalletBalance } from '../wallets';

export async function pullSuiNativeBalance(conn: Connection, address: string): Promise<WalletBalance> {
  const provider = new JsonRpcProvider(conn);

  const rawBalance = await provider.getBalance({ owner: address });

  return {
    isNative: true,
    rawBalance: rawBalance.totalBalance.toString(),
  } as WalletBalance;
}

export function pullSuiTokenBalance() {
  throw new Error('pullSuiTokenBalance is not yet implemented for SUI wallet');
}