import bs58 from 'bs58';
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Balance } from "./index";

export async function pullSolanaNativeBalance(
  connection: Connection,
  address: string
): Promise<Balance> {
  const lamports = await connection.getBalance(new PublicKey(address))

  return {
    isNative: true,
    rawBalance: lamports.toString()
  }
}

export function getSolanaAddressFromPrivateKey(privateKey: string): string {
  let secretKey;
  try {
    secretKey = new Uint8Array(JSON.parse(privateKey));
  } catch (e) {
    secretKey = bs58.decode(privateKey);
  }
  return Keypair.fromSecretKey(secretKey).publicKey.toBase58()
}