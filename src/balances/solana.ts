import {Connection, PublicKey} from "@solana/web3.js";
import {Balance} from "./index";

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