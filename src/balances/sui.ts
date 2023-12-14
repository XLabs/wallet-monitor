import {
  Connection,
  JsonRpcProvider,
  Secp256k1Keypair,
  Ed25519Keypair,
  PRIVATE_KEY_SIZE,
  RawSigner,
  TransactionBlock,
  SuiTransactionBlockResponse,
} from "@mysten/sui.js";
import { WalletBalance } from "../wallets";
import { parseFixed } from "@ethersproject/bignumber";

export type SuiTokenData = {
  symbol: string;
  decimals: number;
  address: string;
};

export interface SuiTransactionDetails {
  targetAddress: string;
  amount: number;
  maxGasPrice?: number;
  gasLimit?: number;
}

export async function pullSuiNativeBalance(
  conn: Connection,
  address: string,
): Promise<WalletBalance> {
  const provider = new JsonRpcProvider(conn);

  // mysten SDK doesn't support passing checkpoint (block number) to getBalance
  // https://github.com/MystenLabs/sui/issues/14137
  const rawBalance = await provider.getBalance({ owner: address });

  return {
    isNative: true,
    rawBalance: rawBalance.totalBalance.toString(),
  } as WalletBalance;
}

// taken from: https://github.com/MystenLabs/sui/blob/818406c5abdf7de1b80915a0519071eec3a5b1c7/crates/sui-types/src/crypto.rs#L1650
// see: https://github.com/MystenLabs/sui/blob/d1d6eba/sdk/typescript/src/cryptography/ed25519-keypair.ts#L65
const keyPairsByHexPrefix = {
  "0x00": buildEd25519KeyPair,
  "0x01": buildSecp256k1KeyPair,
};

export async function pullSuiTokenData(
  conn: Connection,
  address: string,
): Promise<SuiTokenData> {
  const provider = new JsonRpcProvider(conn);
  const coinData = await provider.getCoinMetadata({ coinType: address });

  if (!coinData) {
    throw new Error(`Coin data not found for address: ${address}`);
  }

  return {
    symbol: coinData.symbol,
    decimals: coinData.decimals,
    address: address,
  };
}

export async function pullSuiTokenBalances(
  conn: Connection,
  address: string,
): Promise<
  {
    coinType: string;
    coinObjectCount: number;
    totalBalance: string;
    lockedBalance: {
      number?: number | undefined;
      epochId?: number | undefined;
    };
  }[]
> {
  const provider = new JsonRpcProvider(conn);

  return provider.getAllBalances({ owner: address });
}

export async function transferSuiNativeBalance(
  conn: Connection,
  privateKey: string,
  txDetails: SuiTransactionDetails,
): Promise<any> {
  const provider = new JsonRpcProvider(conn);
  const { targetAddress, amount } = txDetails;

  try {
    const keyPair = buildSuiKeyPairFromPrivateKey(privateKey);
    const signer = new RawSigner(keyPair, provider);
    const tx = new TransactionBlock();
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);

    tx.transferObjects([coin], tx.pure(targetAddress));
    const txBlock = await signer.signAndExecuteTransactionBlock({
      transactionBlock: tx,
    });

    return makeTxReceipt(
      await provider.getTransactionBlock({
        digest: txBlock.digest,
        options: { showEffects: true, showInput: true },
      }),
    );
  } catch (error) {
    throw new Error(
      `Could not transfer native balance to address ${targetAddress}. Error: ${
        (error as Error)?.stack || error
      }`,
    );
  }
}

function makeTxReceipt(txn: SuiTransactionBlockResponse) {
  const { digest, effects, transaction } = txn;
  if (!effects) {
    return { transactionHash: digest };
  }

  const { gasUsed: gasConsumed } = effects;

  // from: https://docs.sui.io/build/sui-gas-charges#transaction-output-gascostsummary
  const totalGasUsed = parseFixed(gasConsumed.computationCost, 0)
    .add(parseFixed(gasConsumed.storageCost, 0))
    .sub(parseFixed(gasConsumed.storageRebate, 0));

  let gasUsed = "0";
  let gasPrice = "0";

  if (transaction) {
    gasPrice = transaction.data.gasData.price;
    gasUsed = totalGasUsed.div(gasPrice).toString();
  }

  // Gas price and formattedCost are in mist
  return {
    transactionHash: digest,
    gasUsed, // gas price referenced from: https://docs.sui.io/build/sui-gas-charges#transaction-output-gascostsummary
    gasPrice,
    formattedCost: parseFixed(totalGasUsed.toString(), 0).toString(),
  };
}

function buildSecp256k1KeyPair(key: Buffer): Secp256k1Keypair {
  return Secp256k1Keypair.fromSecretKey(key);
}

function buildEd25519KeyPair(key: Buffer): Ed25519Keypair {
  return Ed25519Keypair.fromSecretKey(key);
}

function buildSuiKeyPairFromPrivateKey(
  privateKey: string,
): Secp256k1Keypair | Ed25519Keypair {
  const parsedKey = Buffer.from(privateKey, "base64");

  let key, buildKeyPair;
  if (parsedKey.length === PRIVATE_KEY_SIZE + 1) {
    key = parsedKey.slice(1);
    const schemaPrefix = `0x${parsedKey.slice(0, 1).toString("hex")}`;

    buildKeyPair =
      keyPairsByHexPrefix[schemaPrefix as keyof typeof keyPairsByHexPrefix];

    if (!buildKeyPair) {
      throw new Error(`Invalid Keypair: prefix ${schemaPrefix}`);
    }
  } else if (parsedKey.length === PRIVATE_KEY_SIZE) {
    key = parsedKey;
    buildKeyPair = buildEd25519KeyPair;
  } else {
    throw new Error(
      `Invalid Sui private key. Expected length: 32 or 33 bytes, actual length: ${parsedKey.length}`,
    );
  }

  return buildKeyPair(key);
}

export function getSuiAddressFromPrivateKey(privateKey: string) {
  let keyPair;
  try {
    keyPair = buildSuiKeyPairFromPrivateKey(privateKey);
  } catch (error) {
    throw new Error(
      `Invalid Sui private key. Error: ${(error as Error)?.stack || error}`,
    );
  }

  return keyPair.getPublicKey().toSuiAddress();
}
