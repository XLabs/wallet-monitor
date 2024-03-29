import { Gauge, Registry } from "prom-client";
import { Logger } from "winston";
import { TimeLimitedCache } from "../utils";
import { TokenInfo, WalletPriceFeedConfig } from "../wallet-manager";
import { getCoingeckoPrices } from "./helper";
import { CoinGeckoIds } from "./supported-tokens.config";
import { PriceFeed, TokenPriceData } from "./price-feed";

const DEFAULT_TOKEN_PRICE_RETENSION_TIME = 5 * 1000; // 5 seconds
/**
 * OnDemandPriceFeed is a price feed that fetches token prices from coingecko on-demand
 */
export class OnDemandPriceFeed extends PriceFeed<string, number | undefined> {
  // here cache key is tokenContractAddress
  private cache = new TimeLimitedCache<CoinGeckoIds, number>();
  supportedTokens: TokenInfo[];
  tokenPriceGauge?: Gauge;
  private tokenContractToCoingeckoId: Record<string, CoinGeckoIds> = {};

  constructor(
    priceAssistantConfig: WalletPriceFeedConfig,
    logger: Logger,
    registry?: Registry,
  ) {
    super("ONDEMAND_TOKEN_PRICE", logger, registry, undefined);
    this.supportedTokens = priceAssistantConfig.supportedTokens;

    this.tokenContractToCoingeckoId = this.supportedTokens.reduce(
      (acc, token) => {
        acc[token.tokenContract] = token.coingeckoId as CoinGeckoIds;
        return acc;
      },
      {} as Record<string, CoinGeckoIds>,
    );

    if (registry) {
      this.tokenPriceGauge = new Gauge({
        name: "token_usd_price",
        help: "Current price for a token",
        labelNames: ["symbol"],
        registers: [registry],
      });
    }
  }

  start() {
    // no op
  }

  stop() {
    // no op
  }

  public getCoinGeckoId(tokenContract: string): CoinGeckoIds | undefined {
    return this.tokenContractToCoingeckoId[tokenContract];
  }

  protected get(coingeckoId: string): number | undefined {
    return this.cache.get(coingeckoId as CoinGeckoIds);
  }

  async pullTokenPrices() {
    const coingekoTokens = [];
    const priceDict: TokenPriceData = {};
    for (const token of this.supportedTokens) {
      const { coingeckoId } = token;

      // Check if we already have the price for this token
      const cachedPrice = this.cache.get(coingeckoId);
      if (cachedPrice) {
        priceDict[coingeckoId] = cachedPrice;
        continue;
      }
      coingekoTokens.push(token);
    }

    if (coingekoTokens.length === 0) {
      // All the cached tokens price are already available and valid
      return priceDict;
    }

    const coingekoTokenIds = coingekoTokens.map(token => token.coingeckoId);
    const coingeckoData = await getCoingeckoPrices(
      coingekoTokenIds,
      this.logger,
    );
    for (const token of this.supportedTokens) {
      const { coingeckoId, symbol } = token;

      if (!(coingeckoId in coingeckoData)) {
        this.logger.warn(
          `Token ${symbol} (coingecko: ${coingeckoId}) not found in coingecko response data`,
        );
        continue;
      }

      const tokenPrice = coingeckoData?.[coingeckoId]?.usd;
      if (tokenPrice) {
        this.cache.set(
          coingeckoId,
          tokenPrice,
          DEFAULT_TOKEN_PRICE_RETENSION_TIME,
        );
        priceDict[coingeckoId] = tokenPrice;
        this.tokenPriceGauge?.labels({ symbol }).set(tokenPrice);
      }
    }
    return priceDict;
  }

  async update() {
    // no op
  }
}
