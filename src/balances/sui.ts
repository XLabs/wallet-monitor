import { Connection, JsonRpcProvider, Secp256k1Keypair } from '@mysten/sui.js';
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

export function getSuiAddressFromPrivateKey(privateKey: string) {
  let keyPair;

  try {
    keyPair = Secp256k1Keypair.fromSecretKey(Buffer.from(privateKey, 'base64'));
  } catch (error) {
    throw new Error(`Invalid Sui private key. Error: ${error}`);
  }

  return keyPair.getPublicKey().toSuiAddress();
}