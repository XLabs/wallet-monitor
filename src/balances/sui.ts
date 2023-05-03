import { Connection, JsonRpcProvider, Secp256k1Keypair, Ed25519Keypair, Keypair, PRIVATE_KEY_SIZE } from '@mysten/sui.js';
import { WalletBalance } from '../wallets';

export async function pullSuiNativeBalance(conn: Connection, address: string): Promise<WalletBalance> {
  const provider = new JsonRpcProvider(conn);

  const rawBalance = await provider.getBalance({ owner: address });

  return {
    isNative: true,
    rawBalance: rawBalance.totalBalance.toString(),
  } as WalletBalance;
}

// taken from: https://github.com/MystenLabs/sui/blob/818406c5abdf7de1b80915a0519071eec3a5b1c7/crates/sui-types/src/crypto.rs#L1650
// see: https://github.com/MystenLabs/sui/blob/d1d6eba/sdk/typescript/src/cryptography/ed25519-keypair.ts#L65
const keyPairsByHexPrefix = {
  '0x00': buildEd25519KeyPair,
  '0x01': buildSecp256k1KeyPair,
}

export function pullSuiTokenBalance() {
  throw new Error('pullSuiTokenBalance is not yet implemented for SUI wallet');
}

function buildSecp256k1KeyPair(key: Buffer): Secp256k1Keypair {
  return Secp256k1Keypair.fromSecretKey(key);
}

function buildEd25519KeyPair(key: Buffer): Ed25519Keypair {
  return Ed25519Keypair.fromSecretKey(key);
}

export function getSuiAddressFromPrivateKey(privateKey: string) {
  let parsedKey = Buffer.from(privateKey, 'base64');

  if (parsedKey.length !== PRIVATE_KEY_SIZE && parsedKey.length !== PRIVATE_KEY_SIZE+1) {
    throw new Error(`Invalid Sui private key. Expected length: 32 or 34 bytes, actual length: ${parsedKey.length}`);
  }

  let key, buildKeyPair;
  if (parsedKey.length === PRIVATE_KEY_SIZE+1) {
    key = parsedKey.slice(1);
    const schemaPrefix =`0x${parsedKey.slice(0, 1).toString('hex')}`
    console.log('scheme', schemaPrefix);
    console.log('key', key.length);
    // parsedKey.slice(0, 2).toString('hex')
    buildKeyPair = keyPairsByHexPrefix[
      schemaPrefix as keyof typeof keyPairsByHexPrefix
    ];

    if (!buildKeyPair) {
      throw new Error(`Invalid Keypair: prefix ${schemaPrefix}`);
    }
  }

  else if (parsedKey.length === PRIVATE_KEY_SIZE) {
    key = parsedKey;
    buildKeyPair = buildEd25519KeyPair;
  }

  else {
    throw new Error(`Invalid Sui private key. Expected length: 32 or 33 bytes, actual length: ${parsedKey.length}`);
  }


  let keyPair;
  try {
    keyPair = buildKeyPair(key);
  } catch (error) {
    throw new Error(`Invalid Sui private key. Error: ${error}`);
  }

  return keyPair.getPublicKey().toSuiAddress();
}