import { WalletBalancesByAddress } from "./single-wallet-manager";

export type RebalanceInstruction = {
  sourceAddress: string;
  targetAddress: string;
  amount: number;
}

export type RebalanceStrategy = (balances: WalletBalancesByAddress) => { shouldRebalance: boolean, instructions: RebalanceInstruction[] };

export type RebalanceStrategyName = keyof typeof rebalanceStrategies;

function defaultRebalanceStrategy(balances: WalletBalancesByAddress): { shouldRebalance: boolean, instructions: RebalanceInstruction[] } {
  const shouldRebalance = false;
  const instructions: RebalanceInstruction[] = [];

  return { shouldRebalance, instructions };
}

export const rebalanceStrategies: Record<string, RebalanceStrategy> = {
  default: defaultRebalanceStrategy,
};