import { Gauge, Registry } from "prom-client";
import { Logger } from "winston";
import { TokenPriceData } from "./token-price-feed";
import { TimeLimitedCache } from "../utils";
import { TokenInfo, WalletPriceAssistantConfig } from "../wallet-manager";
import { getCoingeckoPrices } from "./helper";


const DEFAULT_PRICE_PRECISION = 8;

class OnDemandPriceFeed {
    private cache = new TimeLimitedCache<string, TokenPriceData>;
    supportedTokens: TokenInfo[];
    tokenPriceGauge?: Gauge;
    protected pricePrecision: number;
    protected logger: Logger;

    constructor(priceAssistantConfig: WalletPriceAssistantConfig, logger: Logger, registry?: Registry) {
        const {supportedTokens, pricePrecision} = priceAssistantConfig;
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

    async get(token: string[]): Promise<bigint | undefined> {
        const coingekoTokenIds = this.supportedTokens.map((token) => token.coingeckoId);
        // Check if we already have the price for this token
        const cachedPrice = this.cache.get(token);
        if (cachedPrice?.[token]) {
            return cachedPrice[token];
        }

        // If we don't have the price, fetch it from an external API
        const price = await getCoingeckoPrices(token);

        // Cache the price for future requests
        this.prices.set(token, price);

        return price;
    }
}

