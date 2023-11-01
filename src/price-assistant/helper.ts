import axios from "axios";
import { inspect } from "util";
import { Logger } from "winston";
import { WalletManagerConfig, WalletPriceAssistantConfig, WalletPriceAssistantOptions } from "../wallet-manager";
import { CoinGeckoIds } from "./supported-tokens.config";

type CoinGeckoPriceDict = Partial<{
    [k in CoinGeckoIds]: {
        usd: number;
    };
}>;

export const preparePriceAssistantConfig = (config: WalletManagerConfig, options?: WalletPriceAssistantOptions): WalletPriceAssistantConfig => {
    const priceAssistantConfig: WalletPriceAssistantConfig = {
        supportedTokens: [],
        interval: options?.interval,
        pricePrecision: options?.pricePrecision,
    };

    for (const [_, chainConfig] of Object.entries(config)) {
        const {priceAssistantChainConfig} = chainConfig;
        if (priceAssistantChainConfig?.enabled) {
            priceAssistantConfig.supportedTokens.push(...priceAssistantChainConfig.supportedTokens)
        }
    }

    return priceAssistantConfig;
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