import { WalletManagerConfig, WalletPriceAssistantConfig, WalletPriceAssistantOptions } from "../wallet-manager";

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