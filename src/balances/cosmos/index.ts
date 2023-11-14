import { rawSecp256k1PubkeyToRawAddress } from "@cosmjs/amino";
import { Secp256k1 } from "@cosmjs/crypto";
import { fromHex, toBech32 } from "@cosmjs/encoding";
import { SigningStargateClient } from "@cosmjs/stargate";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { CosmosProvider } from "../../wallets/cosmos";
import { Balance } from "..";
import { ethers } from "ethers";
import BN from "bn.js";
import elliptic from "elliptic";

export async function pullCosmosNativeBalance(
  provider: CosmosProvider,
  address: string,
  denomination: string,
): Promise<Balance> {
  const balance = await provider.getBalance(address, denomination);

  return {
    isNative: true,
    rawBalance: balance.amount,
  };
}

export type CosmosTransferTransactionDetails = {
  targetAddress: string;
  amount: number;
  addressPrefix: string;
  defaultDecimals: number;
  nativeDenom: string;
  nodeUrl: string;
};

export async function transferCosmosNativeBalance(
  privateKey: string,
  txDetails: CosmosTransferTransactionDetails,
) {
  const {
    targetAddress,
    amount,
    addressPrefix,
    defaultDecimals,
    nativeDenom,
    nodeUrl,
  } = txDetails;
  const signer = await createSigner(privateKey, addressPrefix);
  const wallet = await SigningStargateClient.connectWithSigner(nodeUrl, signer);

  const encodedAmount = {
    denom: nativeDenom,
    amount: ethers.utils
      .parseUnits(amount.toString(), defaultDecimals)
      .toString(),
  };

  const accounts = await signer.getAccounts();
  const receipt = await wallet.sendTokens(
    accounts[0].address,
    targetAddress,
    [encodedAmount],
    "auto",
  );

  return {
    transactionHash: receipt.transactionHash,
    gasUsed: receipt.gasUsed.toString(),
    gasPrice: "", // TODO: Gas price is not available in the tx receipt
    formattedCost: "", // TODO: Tx cost is not available in the tx receipt
  };
}

export interface Secp256k1Keypair {
  /** A 32 byte private key */
  readonly pubkey: Uint8Array;
  /**
   * A raw secp256k1 public key.
   *
   * The type itself does not give you any guarantee if this is
   * compressed or uncompressed. If you are unsure where the data
   * is coming from, use `Secp256k1.compressPubkey` or
   * `Secp256k1.uncompressPubkey` (both idempotent) before processing it.
   */
  readonly privkey: Uint8Array;
}

// Extracted from: https://github.com/cosmos/cosmjs/blob/33271bc51c/packages/crypto/src/secp256k1.ts#L31
// and changed the return type to Secp256k1Keypair instead of a Promise<Secp256k1Keypair>
// so we can make sync calls to this function. This is needed because the stack trace goes back to a
// class constructor and we can't use async/await in a constructor.
function makeKeypair(privkey: Uint8Array): Secp256k1Keypair {
  const secp256k1 = new elliptic.ec("secp256k1");
  const secp256k1N = new BN(
    "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141",
    "hex",
  );
  if (privkey.length !== 32) {
    // is this check missing in secp256k1.validatePrivateKey?
    // https://github.com/bitjson/bitcoin-ts/issues/4
    throw new Error("input data is not a valid secp256k1 private key");
  }

  const keypair = secp256k1.keyFromPrivate(privkey);
  if (keypair.validate().result !== true) {
    throw new Error("input data is not a valid secp256k1 private key");
  }

  // range test that is not part of the elliptic implementation
  const privkeyAsBigInteger = new BN(privkey);
  if (privkeyAsBigInteger.gte(secp256k1N)) {
    // not strictly smaller than N
    throw new Error("input data is not a valid secp256k1 private key");
  }

  const out: Secp256k1Keypair = {
    privkey: fromHex(keypair.getPrivate("hex")),
    // encodes uncompressed as
    // - 1-byte prefix "04"
    // - 32-byte x coordinate
    // - 32-byte y coordinate
    pubkey: Uint8Array.from(keypair.getPublic("array")),
  };
  return out;
}

export async function createSigner(privateKey: string, addressPrefix: string) {
  const pk = new Uint8Array(Buffer.from(JSON.parse(privateKey)));
  return await DirectSecp256k1Wallet.fromKey(pk, addressPrefix);
}

export function getCosmosAddressFromPrivateKey(
  privateKey: string,
  addressPrefix: string,
): string {
  const uncompressed = makeKeypair(fromHex(privateKey)).pubkey;
  const compressed = Secp256k1.compressPubkey(uncompressed);
  return toBech32(addressPrefix, rawSecp256k1PubkeyToRawAddress(compressed));
}
