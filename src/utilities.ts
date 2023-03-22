import { createWalletToolbox } from "./wallets";
import { KnownChainNames } from "./wallets/wormhole-related-utils";

type BalanceRequestConfig = {
  [chainName in KnownChainNames]: {
    [address: string]: string[];
  };
}

export function getBalances(config: BalanceRequestConfig) {
  const promises = Object.entries(config).map(([chainName, addresses]) => {
    const addr = addresses.map((a) => ({ address: a.address, tokens: [] }));
    const toolbox = createWalletToolbox(chainName, addr);
    return toolbox.pullBalances();
  });

  return Promise.all(promises);
}

export function getAddressBalance(chainName: string, address: string) {
  return createWalletToolbox(chainName, [{ address, tokens: [] }]).pullBalances();
}


export function getAddressTokenBalance(chainName: string, address: string) {

}