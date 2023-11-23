import { Gauge, Registry } from "prom-client";
import { Logger } from "winston";
import { PriceFeed, TokenPriceData } from "./price-feed";
import { TokenInfo, WalletPriceFeedConfig } from "../wallet-manager";
import { getCoingeckoPrices } from "./helper";
import { inspect } from "util";
import { CoinGeckoIds } from "./supported-tokens.config";

/**
 * ScheduledPriceFeed is a price feed that periodically fetches token prices from coingecko
 */
export class ScheduledPriceFeed extends PriceFeed<string, bigint | undefined> {
  private data = {} as TokenPriceData;
  supportedTokens: TokenInfo[];
  tokenPriceGauge?: Gauge;
  private tokenContractToCoingeckoId: Record<string, CoinGeckoIds> = {};

  constructor(priceFeedConfig: WalletPriceFeedConfig, logger: Logger, registry?: Registry) {
    const {scheduled, supportedTokens} = priceFeedConfig;
    super("SCHEDULED_TOKEN_PRICE", logger, registry, scheduled?.interval);
    this.supportedTokens = supportedTokens;

    this.tokenContractToCoingeckoId = supportedTokens.reduce((acc, token) => {
      acc[token.tokenContract] = token.coingeckoId as CoinGeckoIds;
      return acc;
    }, {} as Record<string, CoinGeckoIds>);

    if (registry) {
      this.tokenPriceGauge = new Gauge({
        name: "token_usd_price",
        help: "Current price for a token",
        labelNames: ["symbol"],
        registers: [registry],
      });
    }
  }

  public getCoinGeckoId (tokenContract: string): CoinGeckoIds | undefined {
    return this.tokenContractToCoingeckoId[tokenContract];
  }

  async pullTokenPrices () {
    // no op
  }

  async update() {
    const coingekoTokenIds = this.supportedTokens.map((token) => token.coingeckoId);
    const coingeckoData = await getCoingeckoPrices(coingekoTokenIds, this.logger);
    for (const token of this.supportedTokens) {
      const { coingeckoId, symbol } = token;

      if (!(coingeckoId in coingeckoData)) {
        this.logger.warn(`Token ${symbol} (coingecko: ${coingeckoId}) not found in coingecko response data`);
        continue;
      }

      const tokenPrice = coingeckoData?.[coingeckoId]?.usd;
      if (tokenPrice) {
        this.data[coingeckoId] = BigInt(tokenPrice);
        this.tokenPriceGauge?.labels({ symbol }).set(Number(tokenPrice));
      }
    }
    this.logger.debug(`Updated price feed token prices: ${inspect(this.data)}`);
  }

  protected get(coingeckoId: string): bigint | undefined {
    return this.data[coingeckoId];
  }
}

