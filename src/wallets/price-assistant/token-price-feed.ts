import axios from "axios";
import { inspect } from "util";
import { Gauge, Registry } from "prom-client";
import { Logger } from "winston";
import { PriceFeed } from "./price-feed";
import { CoinGeckoIds } from "./supported-tokens.config";
import { TokenInfo, WalletPriceAssistantConfig } from "../../wallet-manager";

export type TokenPriceData = Partial<Record<string, bigint>>;

type CoinGeckoPriceDict = Partial<{
  [k in CoinGeckoIds]: {
    usd: number;
  };
}>;

/**
 * TokenPriceFeed is a price feed that fetches token prices from coingecko
 *
 */
export class TokenPriceFeed extends PriceFeed<string, bigint | undefined> {
  private data = {} as TokenPriceData;
  supportedTokens: TokenInfo[];
  tokenPriceGauge?: Gauge;

  constructor(priceAssistantConfig: WalletPriceAssistantConfig, logger: Logger, registry?: Registry) {
    const {interval, supportedTokens, pricePrecision} = priceAssistantConfig;
    super("TOKEN_PRICE", logger, registry, interval, pricePrecision);
    this.supportedTokens = supportedTokens;
    if (registry) {
      this.tokenPriceGauge = new Gauge({
        name: "token_usd_price",
        help: "Current price for a token",
        labelNames: ["symbol"],
        registers: [registry],
      });
    }
  }

  async update() {
    const coingekoTokenIds = this.supportedTokens.map((token) => token.coingeckoId);
    const coingeckoData = await getCoingeckoPrices(coingekoTokenIds, this.logger);
    for (const token of this.supportedTokens) {
      const { coingeckoId, symbol } = token;
      if (coingeckoId in coingeckoData) {
        const tokenPrice = (coingeckoData as Required<typeof coingeckoData>)[coingeckoId]!.usd;
        this.data[coingeckoId] = BigInt(Math.round(tokenPrice * 10 ** this.pricePrecision));
        this.tokenPriceGauge?.labels({ symbol }).set(Number(tokenPrice));
      } else {
        this.logger.warn(`Token ${symbol} (coingecko: ${coingeckoId}) not found in coingecko response data`);
      }
    }
    this.logger.debug(`Updated price feed token prices: ${inspect(this.data)}`);
  }

  protected get(token: string): bigint | undefined {
    return this.data[token];
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
