import axios from "axios";
import { inspect } from "util";
import { Logger } from "winston";
import { CoinGeckoIds } from "./supported-tokens.config";

export type CoinGeckoPriceDict = Partial<{
  [k in CoinGeckoIds]: {
    usd: number;
  };
}>;

/**
 * @param tokens - array of coingecko ids for tokens
 */
export async function getCoingeckoPrices(
  tokens: string[] | string,
  logger: Logger,
): Promise<CoinGeckoPriceDict> {
  const tokensToProcess =
    typeof tokens === "string" ? tokens : tokens.join(",");
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${tokensToProcess}&vs_currencies=usd`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (response.status != 200) {
    logger.warn(
      `Failed to get CoinGecko Prices. Response: ${inspect(response)}`,
    );
    throw new Error(`HTTP status != 200. Original Status: ${response.status}`);
  }

  return response.data;
}
