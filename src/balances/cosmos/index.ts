import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { CosmosProvider } from "../../wallets/cosmos";
import { Balance } from "..";

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
