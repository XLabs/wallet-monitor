import { WalletBalancesByAddress } from "./single-wallet-manager";
import { deepClone, omit } from "./utils";

export type RebalanceInstruction = {
  sourceAddress: string;
  targetAddress: string;
  amount: number;
}

export type RebalanceStrategy = (balances: WalletBalancesByAddress, minBalance: number) => RebalanceInstruction[];

export type RebalanceStrategyName = keyof typeof rebalanceStrategies;


const getAddressWithMaxBalance = (balances: WalletBalancesByAddress) => {
  let max = 0;
  let maxAddress = '';
  for (const balance of Object.values(balances)) {
    if (!max || +balance.rawBalance > max) {
      max = +balance.rawBalance;
      maxAddress = balance.address;
    }
  }

  return maxAddress;
};

/**
 * 
 */
function fillFromMaxRebalanceStrategy(balances: WalletBalancesByAddress, minBalance: number) {
  let sources = {} as WalletBalancesByAddress;
  const targetAddresses = [];

  for (const [address, balance] of Object.entries(balances)) {
    if (+balance.formattedBalance < minBalance) {
      targetAddresses.push(address);
    }

    else {
      sources[address] = deepClone(balance);
    }
  }

  if (!targetAddresses.length) return [];

  const instructions: RebalanceInstruction[] = [];

  for (const targetAddress of targetAddresses) {
    if (!Object.keys(sources).length) throw new Error('No possible sources to rebalance from');

    const sourceAddress = getAddressWithMaxBalance(sources);

    const difference = +sources[sourceAddress].formattedBalance - minBalance;

    const amount = difference / 2;

    instructions.push({ sourceAddress, targetAddress, amount });

    const newWalletBalance = +sources[sourceAddress].formattedBalance - amount;

    if (newWalletBalance < minBalance) {
      sources[sourceAddress].formattedBalance = String(minBalance);
    }

    else {
      sources = omit(sources, sourceAddress);
    }
  }

  return instructions;
}

export const rebalanceStrategies: Record<string, RebalanceStrategy> = {
  fillFromMax: fillFromMaxRebalanceStrategy,
};