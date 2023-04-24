import { WalletBalancesByAddress } from "./single-wallet-manager";

export type RebalanceInstruction = {
  sourceAddress: string;
  targetAddress: string;
  amount: number;
}

export type RebalanceStrategy = (balances: WalletBalancesByAddress) => RebalanceInstruction[];

export type RebalanceStrategyName = keyof typeof rebalanceStrategies;

function fillFromMaxRebalanceStrategy(balances: WalletBalancesByAddress) {
  const instructions: RebalanceInstruction[] = [];




  return instructions;
}

export const rebalanceStrategies: Record<string, RebalanceStrategy> = {
  fillFromMax: fillFromMaxRebalanceStrategy,
};