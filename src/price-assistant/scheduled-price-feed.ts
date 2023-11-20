import { Gauge, Registry } from "prom-client";
import { Logger } from "winston";
import { PriceFeed, TokenPriceData } from "./price-feed";
import { TokenInfo, WalletPriceFeedConfig } from "../wallet-manager";
import { getCoingeckoPrices } from "./helper";
import { mapConcurrent } from "../utils";

/**
 * ScheduledPriceFeed is a price feed that periodically fetches token prices from coingecko
 */
export class ScheduledPriceFeed extends PriceFeed<string, bigint | undefined> {
  private data = {} as TokenPriceData;
  supportedTokens: TokenInfo[];
  tokenPriceGauge?: Gauge;

  constructor(priceFeedConfig: WalletPriceFeedConfig, logger: Logger, registry?: Registry) {
    const {scheduled, supportedTokens, pricePrecision} = priceFeedConfig;
    super("SCHEDULED_TOKEN_PRICE", logger, registry, scheduled?.interval, pricePrecision);
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

  public async pullTokenPrices(tokens: string[]): Promise<TokenPriceData> {
    const tokenPrices = {} as TokenPriceData;
    await mapConcurrent(tokens, async (token) => {
      tokenPrices[token] = await this.get(token);
    })
    return tokenPrices;
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

  protected async get(tokenContract: string): Promise<bigint | undefined> {
    return this.data[tokenContract];
  }
}

