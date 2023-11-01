import { Gauge, Registry } from "prom-client";
import { Logger } from "winston";
import { ScheduledPriceFeed } from "./price-feed";
import { TokenInfo, WalletPriceAssistantConfig } from "../wallet-manager";
import { getCoingeckoPrices } from "./helper";

export type TokenPriceData = Partial<Record<string, bigint>>;

/**
 * TokenPriceFeed is a price feed that fetches token prices from coingecko
 *
 */
export class TokenPriceFeed extends ScheduledPriceFeed<string, bigint | undefined> {
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
      const { coingeckoId, symbol, tokenContract } = token;

      if (!(coingeckoId in coingeckoData)) {
        this.logger.warn(`Token ${symbol} (coingecko: ${coingeckoId}) not found in coingecko response data`);
        continue;
      }

      const tokenPrice = coingeckoData?.[coingeckoId]?.usd;
      if (tokenPrice) {
        // Token Price is stored by token contract address
        this.data[tokenContract] = BigInt(Math.round(tokenPrice * 10 ** this.pricePrecision));
        this.tokenPriceGauge?.labels({ symbol }).set(Number(tokenPrice));
      }
    }
    // this.logger.debug(`Updated price feed token prices: ${inspect(this.data)}`);
  }

  protected get(tokenContract: string): bigint | undefined {
    return this.data[tokenContract];
  }
}

