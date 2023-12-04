import axios from "axios";
import { inspect } from "util";
import { Logger } from "winston";
import { CoinGeckoIds, supportedNativeTokensByEnv } from "./supported-tokens.config";
import { Environment } from "../wallets";
import { TokenInfo, WalletManagerConfig } from "../wallet-manager";

export type CoinGeckoPriceDict = Partial<{
  [k in CoinGeckoIds]: {
    usd: number;
  };
}>;

/**
 * @param tokens - array of coingecko ids for tokens
 */
export async function getCoingeckoPrices(
  tokens: string[] | string,
  logger: Logger,
): Promise<CoinGeckoPriceDict> {
  const tokensToProcess =
    typeof tokens === "string" ? tokens : tokens.join(",");
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${tokensToProcess}&vs_currencies=usd`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (response.status != 200) {
    logger.warn(
      `Failed to get CoinGecko Prices. Response: ${inspect(response)}`,
    );
    throw new Error(`HTTP status != 200. Original Status: ${response.status}`);
  }

  return response.data;
}

export function preparePriceFeedConfig (walletConfig: WalletManagerConfig, network?: string) {
  const priceFeedSupportedTokens = Object.values(walletConfig).reduce((acc, chainConfig) => {
    if (!chainConfig.priceFeedConfig?.supportedTokens) return acc;
    return [...acc, ...chainConfig.priceFeedConfig.supportedTokens];
  }, [] as TokenInfo[]);  
  
  // Inject native token into price feed config, if enabled
  // Note: It is safe to use "mainnet" fallback here, because we are only using native token's coingeckoId
  const environment: Environment = network ? network as Environment : Environment.MAINNET;
  const nativeTokens = supportedNativeTokensByEnv[environment];

  for (const nativeToken of nativeTokens) {
    const isNativeTokenDefined = priceFeedSupportedTokens.find(token => token.coingeckoId === nativeToken.coingeckoId);
    if (!isNativeTokenDefined) {
      priceFeedSupportedTokens.push(nativeToken);
    }
  }
  return priceFeedSupportedTokens;
}