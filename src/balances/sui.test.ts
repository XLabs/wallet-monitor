import { describe, expect, test } from '@jest/globals';
import { formatUnits } from "./sui";

describe("Test sui balance util", () => {
    test.concurrent.each([
        ["100000000", 6, "100"], // 100 usdc (usdc has 6 decimals)
        ["1000000000", 9, "1"], // 1 sui (sui has 9 decimals)
        ["10000000000", 9, "10"], // 10 sui
        ["99990000", 6, "99.99"], // 99.99 usdc
        ["123456789", 6, "123.456789"], // full precision usdc
        ["12345678901234", 6, "12345678.901234"], // big number with full precision
        ["1", 6, "0.000001"], // minimal precision for usdc
        ["1", 9, "0.000000001"], // minimal precision for sui
        ["-1", 9, "-0.000000001"], // negative minimal precision for sui
        ["-9950000", 6, "-9.95"], // negative usdc
        ["-1", 6, "-0.000001"], // negative minimal precision for usdc
    ])("Test format units", async (rawUnits: string, decimals: number, expectedFormattedValue: string) => {
        let result = formatUnits(rawUnits, decimals);
        expect(result).toBe(expectedFormattedValue);
    });
});