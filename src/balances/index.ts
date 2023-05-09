import { formatFixed } from "@ethersproject/bignumber";

export type Balance = {
    isNative: boolean;
    rawBalance: string;
}

// Taking a shot at generalizing balance formatting, although this impl depends
// on @ethersproject, I believe it can be useful for other chains as well.
export function formatRawUnits(rawBalance: string, decimals: number): string {
    return formatFixed(rawBalance, decimals).toString();
}