import { WalletManager } from "../../src/wallet-manager";
import { timeout } from "./common";

export const ETH_ADDR = "0xFa6E597ca1c7E72838c850d1268dDf618D444712";
export const ETH_ADDR_2 = "0x0EaC31cB932229D0Dcc628f89894012b7827481c";

export const checkIfWalletIsReady = async (
  walletManager: WalletManager,
): Promise<void> => {
  const isWalletReady = new Promise<boolean>(resolve => {
    walletManager.on("balances", () => {
      resolve(true);
    });
  });

  await timeout<boolean>(isWalletReady, 5000);
};

export const getWallets = () => {
  return [
    {
      address: ETH_ADDR,
      privateKey:
        "0xf9fdbcbcdb4c7c72642be9fe7c09ad5869a961a8ae3c3374841cb6ead5fd34b1",
    },
    {
      address: ETH_ADDR_2,
      privateKey:
        "0xe94000d730b9655850afc8e39facb7058678f11e765075d4806d27ed619f258c",
    },
  ];
};
