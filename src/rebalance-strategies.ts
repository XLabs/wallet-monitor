import { WalletBalancesByAddress } from "./chain-wallet-manager";
import { deepClone, omit } from "./utils";

export type RebalanceInstruction = {
  sourceAddress: string;
  targetAddress: string;
  amount: number;
};

export type RebalanceStrategy = (
  balances: WalletBalancesByAddress,
  minBalance: number,
) => RebalanceInstruction[];

export type RebalanceStrategyName = keyof typeof rebalanceStrategies;

const getAddressWithMaxBalance = (balances: WalletBalancesByAddress) => {
  let max = 0;
  let maxAddress = "";
  for (const balance of Object.values(balances)) {
    if (!max || +balance.formattedBalance > max) {
      max = +balance.formattedBalance;
      maxAddress = balance.address;
    }
  }

  return maxAddress;
};

function pourOverRebalanceStrategy(
  balances: WalletBalancesByAddress,
  minBalance: number,
) {
  let sources = {} as WalletBalancesByAddress;
  const targets = {} as WalletBalancesByAddress;

  for (const [address, balance] of Object.entries(balances)) {
    if (+balance.formattedBalance < minBalance) {
      targets[address] = deepClone(balance);
    } else {
      sources[address] = deepClone(balance);
    }
  }

  if (!Object.keys(targets).length) return [];

  const instructions: RebalanceInstruction[] = [];

  for (const [targetAddress, target] of Object.entries(targets)) {
    if (!Object.keys(sources).length)
      throw new Error("No possible sources to rebalance from");

    const sourceAddress = getAddressWithMaxBalance(sources);

    const difference = +sources[sourceAddress].formattedBalance - minBalance;

    const amount = difference / 2;

    instructions.push({ sourceAddress, targetAddress: targetAddress, amount });

    const newSourceBalance = +sources[sourceAddress].formattedBalance - amount;

    if (newSourceBalance < minBalance * 2) {
      sources = omit(sources, sourceAddress);
    } else {
      sources[sourceAddress].formattedBalance = String(newSourceBalance);
    }

    const newTargetBalance = +targets[targetAddress].formattedBalance + amount;
    targets[targetAddress].formattedBalance = String(newTargetBalance);

    if (newTargetBalance > minBalance) {
      sources[targetAddress] = targets[target.address];
    }
  }

  return instructions;
}

export const rebalanceStrategies: Record<string, RebalanceStrategy> = {
  pourOver: pourOverRebalanceStrategy,
};
