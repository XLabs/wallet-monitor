import axios from "axios";
import { inspect } from "util";
import { Logger } from "winston";
import { WalletManagerConfig, WalletPriceFeedConfig, WalletPriceFeedOptions } from "../wallet-manager";
import { CoinGeckoIds } from "./supported-tokens.config";

export type CoinGeckoPriceDict = Partial<{
    [k in CoinGeckoIds]: {
        usd: number;
    };
}>;

export const preparePriceFeedConfig = (config: WalletManagerConfig, options?: WalletPriceFeedOptions): WalletPriceFeedConfig => {
    const priceFeedConfig: WalletPriceFeedConfig = {
        supportedTokens: [],
        pricePrecision: options?.pricePrecision,
    };

    for (const [_, chainConfig] of Object.entries(config)) {
        const {priceFeedChainConfig} = chainConfig;
        if (priceFeedChainConfig?.enabled) {
            priceFeedConfig.supportedTokens.push(...priceFeedChainConfig.supportedTokens)
        }
    }

    return priceFeedConfig;
}

/**
 * @param tokens - array of coingecko ids for tokens
 */
export async function getCoingeckoPrices(tokens: string[] | string, logger: Logger): Promise<CoinGeckoPriceDict> {
    tokens = typeof tokens === "string" ? tokens : tokens.join(",");
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokens}&vs_currencies=usd`, {
      headers: {
        Accept: "application/json",
      },
    });
  
    if (response.status != 200) {
      logger.warn(`Failed to get CoinGecko Prices. Response: ${inspect(response)}`);
      throw new Error(`HTTP status != 200. Original Status: ${response.status}`);
    }
  
    return response.data;
  }