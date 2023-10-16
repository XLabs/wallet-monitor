import axios from "axios";
import { Logger } from "winston";
import { inspect } from "util";
import { CoinGeckoIds, TokenInfo } from "./supported-tokens.config";

export type TokenPriceData = Partial<Record<string, bigint>>;

type CoinGeckoPriceDict = Partial<{
    [k in CoinGeckoIds]: {
        usd: number;
    };
}>;

class PriceAssistant {
    // TODO: Should data be a cache with time-limit, so we never hit rate limit (100 req/min) on coin-gecko
    private data = {} as TokenPriceData;
    supportedTokens: TokenInfo[];
    protected logger: Logger;
    public readonly pricePrecision = 8;

    constructor (supportedTokens:  TokenInfo[], logger: Logger) {
        this.supportedTokens = supportedTokens;
        this.logger = logger;
    }

    private isSupportedToken (tokenAddress: string) {
        return this.supportedTokens.find(supportedToken => supportedToken.tokenContract === tokenAddress);
    }

    public async getTokenPrices (tokens: string[]) {
        const validTokens = tokens.map(this.isSupportedToken).filter(tokenInfo => !!tokenInfo) as TokenInfo[];
        const coingekoTokenIds = validTokens.map((token) => token.coingeckoId);
        const coingeckoData = await getCoingeckoPrices(coingekoTokenIds, this.logger);

        for (const token of validTokens) {
            if (token.coingeckoId in coingeckoData) {
                const price = coingeckoData[token.coingeckoId]?.usd as number;
                this.data[token.tokenContract] = BigInt(price * 10 ** this.pricePrecision);
            }
        }

        return this.data;
    }
}

/**
 * @param tokens - array of coingecko ids for tokens
 */
async function getCoingeckoPrices(tokens: string[] | string, logger: Logger): Promise<CoinGeckoPriceDict> {
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
  