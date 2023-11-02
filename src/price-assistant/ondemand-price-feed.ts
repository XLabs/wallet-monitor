import { Gauge, Registry } from "prom-client";
import { Logger } from "winston";
import { TimeLimitedCache } from "../utils";
import { TokenInfo, WalletPriceFeedConfig } from "../wallet-manager";
import { getCoingeckoPrices } from "./helper";
import { CoinGeckoIds } from "./supported-tokens.config";
import { TokenPriceData } from "./token-price-feed";

const DEFAULT_PRICE_PRECISION = 8;
const DEFAULT_TOKEN_PRICE_RETENSION_TIME = 5 * 1000; // 5 seconds
/**
 * OnDemandPriceFeed is a price feed that fetches token prices from coingecko on-demand
 */
export class OnDemandPriceFeed {
  // here cache key is tokenContractAddress
  private cache = new TimeLimitedCache<string, bigint>();
  supportedTokens: TokenInfo[];
  tokenPriceGauge?: Gauge;
  protected pricePrecision: number;
  protected logger: Logger;

  constructor(
    priceAssistantConfig: WalletPriceFeedConfig,
    logger: Logger,
    registry?: Registry,
  ) {
    const { supportedTokens, pricePrecision } = priceAssistantConfig;
    this.supportedTokens = supportedTokens;
    this.pricePrecision = pricePrecision || DEFAULT_PRICE_PRECISION;
    this.logger = logger;

    if (registry) {
      this.tokenPriceGauge = new Gauge({
        name: "token_usd_price",
        help: "Current price for a token",
        labelNames: ["symbol"],
        registers: [registry],
      });
    }
  }

  start () {
    // no op
  }

  stop () {
    // no op
  }

  async pullTokenPrices(tokens: string[]): Promise<TokenPriceData> {
    const coingekoTokens = [];
    const priceDict = {} as TokenPriceData;
    for (const token of tokens) {
        const supportedToken = this.supportedTokens.find((supportedToken) => supportedToken.tokenContract === token);
        if (!supportedToken) {
            this.logger.error(`Token ${token} not supported`);
            throw new Error(`Token ${token} not supported`);
        }

        // Check if we already have the price for this token
        const cachedPrice = this.cache.get(token);
        if (cachedPrice) {            
            priceDict[token] = cachedPrice
            continue;
        }
        coingekoTokens.push(supportedToken);
    }

    const coingekoTokenIds = coingekoTokens.map(token => token.coingeckoId)
    // If we don't have the price, fetch it from an external API
    const coingeckoData = await getCoingeckoPrices(coingekoTokenIds, this.logger);

    for (const token of coingekoTokens) {
        const {symbol, coingeckoId, tokenContract} = token;

        if (!(coingeckoId in coingeckoData)) {
            this.logger.warn(`coingecko: ${coingeckoId} not found in coingecko response data`);
            continue;
        }

        const tokenPrice = coingeckoData?.[coingeckoId as CoinGeckoIds]?.usd;
        if (tokenPrice) {
            const preciseTokenPrice = BigInt(Math.round(tokenPrice * 10 ** this.pricePrecision));
            // Token Price is stored by token contract address
            this.cache.set(tokenContract, preciseTokenPrice, DEFAULT_TOKEN_PRICE_RETENSION_TIME);
            priceDict[tokenContract] = preciseTokenPrice;
            this.tokenPriceGauge?.labels({ symbol }).set(Number(tokenPrice));
        }
    }

    return priceDict;
  }

  async getKey (tokenContract: string): Promise<bigint | undefined> {
    const cachedPrice = this.cache.get(tokenContract);
    if (cachedPrice) {
        return cachedPrice;
    }
    const tokenPrices = await this.pullTokenPrices([tokenContract]);
    return tokenPrices[tokenContract];
  }
}
