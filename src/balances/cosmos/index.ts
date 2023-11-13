import { SigningStargateClient } from "@cosmjs/stargate";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { CosmosProvider } from "../../wallets/cosmos";
import { Balance } from "..";
import { ethers } from "ethers";

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

export async function createSigner(privateKey: string, addressPrefix: string) {
  const pk = new Uint8Array(Buffer.from(JSON.parse(privateKey)));
  return await DirectSecp256k1Wallet.fromKey(pk, addressPrefix);
}

export function getCosmosAddressFromPrivateKey(
  privateKey: string,
  addressPrefix: string,
) {
  createSigner(privateKey, addressPrefix).then(wallet => {
    wallet.getAccounts().then(accounts => {
      return accounts[0].address;
    });
  });
}
