# Wallet Monitor

This is a npm package that allows you to monitor the balance of multiple wallets in multiple blockchains.
Along monitoring, it can also export the balances as prometheus metrics and perform rebalancing strategies between your wallets.  
It can be used as a package within a nodejs application (_library modality_) or as a gRPC service (_service modality_).

## Table of Contents

- [TL;DR](#tldr)
- [Contributions](#contributions)
- [WalletManager](#walletmanager)
- [ChainWalletManager](#chainwalletmanager)
- [WalletToolbox](#wallettoolbox)
- [Supported Tokens](#supported-tokens)
- [gRPC service](src/grpc/README.md)

## TL;DR

`WalletManager` exposes a few utilities to monitor the balance of a wallet in a blockchain. Optionally, you can also monitor the balance of tokens for the wallet.  
The module requires near zero configuration by defaulting most required values to what would be reasonable, but it can be configured more granularly if needed.  
`WalletManager` uses underneath multiple `ChainWalletManager` objects, one for each blockchain you want to monitor.  
`ChainWalletManager` in turn uses a `WalletToolbox` object to perform the actual monitoring of the wallet.  
These objects are composed rather than inherited and this means that they will have, in general, different interfaces, but it is always possible to use them independently.  
**Check out the [example](examples/wallet-manager.ts).**

## Contributions

Any feature request for this project is welcomed and will be considered for implementation.  
The more detail you can provide about your use case, the better.

## WalletManager

This is the main object of the package. It is responsible for efficiently dispatching your configuration to the right `ChainWalletManager` objects and for aggregating the results.
It can do locking of each wallet and will also take care of exporting balances, metrics and errors if you want it to.  
In general, it is a useful class to treat a collection of `ChainWalletManager` objects as a single object.

It's useful to explain the properties and features of this class by looking at the configuration and options that are passed to the constructor (using [zod](https://github.com/colinhacks/zod)).

### WalletManagerConfig

```typescript
export const WalletManagerChainConfigSchema = z.object({
  network: z.string().optional(),
  chainConfig: z.any().optional(),
  rebalance: z
    .object({
      enabled: z.boolean(),
      strategy: z.string().optional(),
      interval: z.number().optional(),
      minBalanceThreshold: z.number().optional(),
      maxGasPrice: z.number().optional(),
      gasLimit: z.number().optional(),
    })
    .optional(),
  wallets: z.array(WalletConfigSchema),
});

export const WalletManagerConfigSchema = z.record(
  z.string(),
  WalletManagerChainConfigSchema,
);
```

In short, each record keys is the name of a chain. The value within that record is a network name, an optional rebalancing strategy and a collection of wallets.  
**Also, check out the [rebalancing example](examples/rebalancing.ts).**

### WalletManagerOptions

```typescript
export const WalletManagerOptionsSchema = z.object({
  logger: z.any().optional(),
  logLevel: z
    .union([
      z.literal("error"),
      z.literal("warn"),
      z.literal("info"),
      z.literal("debug"),
      z.literal("verbose"),
      z.literal("silent"),
    ])
    .optional(),
  balancePollInterval: z.number().optional(),
  metrics: z
    .object({
      enabled: z.boolean(),
      port: z.number().optional(),
      path: z.string().optional(),
      registry: z.any().optional(),
      serve: z.boolean().optional(),
    })
    .optional(),
});
```

The options applied to all blockchains and wallets monitored specify logging and if/where to expose prometheus metrics.

There are cases where `WalletManager` needs to be used with all its functionality but the application code does not need
to interact with the monitoring or rebalancing.
In such cases, you can use `buildWalletManager` convenience function which will return a `WalletManager` masked by the correct interface
that will only allow you to interact with the locking mechanisms of the wallets.

## ChainWalletManager

This class knows how to use a `WalletToolbox` to perform chain-specific monitoring and transactional operations.  
The interface is mostly similar to `WalletManager` but it is pending to be refactored to be more consistent.

## WalletToolbox

A `WalletToolbox` handles the communication with the blockchain and is responsible for knowing reasonable defaults
for the blockchain endpoints, networks, token IDs, which sdk to use and how to handle sdk results.

This object is also really useful on its own if you want to have fine-grained control over which network calls you are
making.

### Supported Tokens

While you can pass any token address to the wallet monitor, for simplicity a list of supported tokens is provided so you can use their symbols instead. See the table below:

#### Ethereum

| Symbol                                                                          | Address                                    |
| ------------------------------------------------------------------------------- | ------------------------------------------ |
| [WETH](https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2)   | 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 |
| [USDC](https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48)   | 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 |
| [USDT](https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7)   | 0xdac17f958d2ee523a2206206994597c13d831ec7 |
| [WBTC](https://etherscan.io/token/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599)   | 0x2260fac5e5542a773aa44fbcfedf7c193bc2c599 |
| [WBNB](https://etherscan.io/token/0x418D75f65a02b3D53B2418FB8E1fe493759c7605)   | 0x418D75f65a02b3D53B2418FB8E1fe493759c7605 |
| [WMATIC](https://etherscan.io/token/0x7c9f4C87d911613Fe9ca58b579f737911AAD2D43) | 0x7c9f4C87d911613Fe9ca58b579f737911AAD2D43 |
| [WAVAX](https://etherscan.io/token/0x85f138bfEE4ef8e540890CFb48F620571d67Eda3)  | 0x85f138bfEE4ef8e540890CFb48F620571d67Eda3 |
| [WFTM](https://etherscan.io/token/0x4cD2690d86284e044cb63E60F1EB218a825a7e92)   | 0x4cD2690d86284e044cb63E60F1EB218a825a7e92 |
| [WCELO](https://etherscan.io/token/0x3294395e62f4eb6af3f1fcf89f5602d90fb3ef69)  | 0x3294395e62f4eb6af3f1fcf89f5602d90fb3ef69 |
| [WGLMR](https://etherscan.io/token/0x93d3696A9F879b331f40CB5059e37015423A3Bd0)  | 0x93d3696A9F879b331f40CB5059e37015423A3Bd0 |
| [WSUI](https://etherscan.io/token/0x84074EA631dEc7a4edcD5303d164D5dEa4c653D6)   | 0x84074EA631dEc7a4edcD5303d164D5dEa4c653D6 |
| [WARB](https://etherscan.io/token/0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1)   | 0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1 |

#### Binance Smart Chain

| Symbol                                                                         | Address                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------ |
| [WETH](https://bscscan.com/token/0x4db5a66e937a9f4473fa95b1caf1d1e1d62e29ea)   | 0x4db5a66e937a9f4473fa95b1caf1d1e1d62e29ea |
| [USDC](https://bscscan.com/token/0xB04906e95AB5D797aDA81508115611fee694c2b3)   | 0xB04906e95AB5D797aDA81508115611fee694c2b3 |
| [USDT](https://bscscan.com/token/0x524bC91Dc82d6b90EF29F76A3ECAaBAffFD490Bc)   | 0x524bC91Dc82d6b90EF29F76A3ECAaBAffFD490Bc |
| [WBTC](https://bscscan.com/token/0x43359676e1a3f9fbb5de095333f8e9c1b46dfa44)   | 0x43359676e1a3f9fbb5de095333f8e9c1b46dfa44 |
| [WBNB](https://bscscan.com/token/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c)   | 0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c |
| [WMATIC](https://bscscan.com/token/0xc836d8dC361E44DbE64c4862D55BA041F88Ddd39) | 0xc836d8dC361E44DbE64c4862D55BA041F88Ddd39 |
| [WAVAX](https://bscscan.com/token/0x96412902aa9aFf61E13f085e70D3152C6ef2a817)  | 0x96412902aa9aFf61E13f085e70D3152C6ef2a817 |
| [WFTM](https://bscscan.com/token/0xbF8413EE8612E0E4f66Aa63B5ebE27f3C5883d47)   | 0xbF8413EE8612E0E4f66Aa63B5ebE27f3C5883d47 |
| [WCELO](https://bscscan.com/token/0x2A335e327a55b177f5B40132fEC5D7298aa0D7e6)  | 0x2A335e327a55b177f5B40132fEC5D7298aa0D7e6 |
| [WGLMR](https://bscscan.com/token/0x1C063db3c621BF901FC6C1D03328b08b2F9bbfba)  | 0x1C063db3c621BF901FC6C1D03328b08b2F9bbfba |
| [WSUI](https://bscscan.com/token/0x8314f6Bf1B4dd8604A0fC33C84F9AF2fc07AABC8)   | 0x8314f6Bf1B4dd8604A0fC33C84F9AF2fc07AABC8 |
| [WARB](https://bscscan.com/token/0x0c03a1d484b12c63bd499162fca0a403f8104939)   | 0x0c03a1d484b12c63bd499162fca0a403f8104939 |

#### Polygon

| Symbol                                                                             | Address                                    |
| ---------------------------------------------------------------------------------- | ------------------------------------------ |
| [WETH](https://polygonscan.com/token/0x11CD37bb86F65419713f30673A480EA33c826872)   | 0x11CD37bb86F65419713f30673A480EA33c826872 |
| [USDC](https://polygonscan.com/token/0x4318CB63A2b8edf2De971E2F17F77097e499459D)   | 0x4318CB63A2b8edf2De971E2F17F77097e499459D |
| [USDT](https://polygonscan.com/token/0x9417669fbf23357d2774e9d421307bd5ea1006d2)   | 0x9417669fbf23357d2774e9d421307bd5ea1006d2 |
| [WBTC](https://polygonscan.com/token/0x5d49c278340655b56609fdf8976eb0612af3a0c3)   | 0x5d49c278340655b56609fdf8976eb0612af3a0c3 |
| [WBNB](https://polygonscan.com/token/0xeCDCB5B88F8e3C15f95c720C51c71c9E2080525d)   | 0xeCDCB5B88F8e3C15f95c720C51c71c9E2080525d |
| [WMATIC](https://polygonscan.com/token/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270) | 0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270 |
| [WAVAX](https://polygonscan.com/token/0x7Bb11E7f8b10E9e571E5d8Eace04735fDFB2358a)  | 0x7Bb11E7f8b10E9e571E5d8Eace04735fDFB2358a |
| [WFTM](https://polygonscan.com/token/0x3726831304D77f585f1Aca9d9841cc3Ef80dAa62)   | 0x3726831304D77f585f1Aca9d9841cc3Ef80dAa62 |
| [WCELO](https://polygonscan.com/token/0x922F49a9911effc034eE756196E59BE7b90D43b3)  | 0x922F49a9911effc034eE756196E59BE7b90D43b3 |
| [WGLMR](https://polygonscan.com/token/0xcC48d6CF842083fEc0E01d913fB964b585975F05)  | 0xcC48d6CF842083fEc0E01d913fB964b585975F05 |
| [WSUI](https://polygonscan.com/token/0x34bE049fEbfc6C64Ffd82Da08a8931A9a45f2cc8)   | 0x34bE049fEbfc6C64Ffd82Da08a8931A9a45f2cc8 |
| [WARB](https://polygonscan.com/token/0x33c788e1191d18ccd0b6db8176ead234ed22321a)   | 0x33c788e1191d18ccd0b6db8176ead234ed22321a |

#### Avalanche

| Symbol                                                                                       | Address                                    |
| -------------------------------------------------------------------------------------------- | ------------------------------------------ |
| [WETH](https://avascan.info/blockchain/c/token/0x8b82A291F83ca07Af22120ABa21632088fC92931)   | 0x8b82A291F83ca07Af22120ABa21632088fC92931 |
| [USDC](https://avascan.info/blockchain/c/token/0xB24CA28D4e2742907115fECda335b40dbda07a4C)   | 0xB24CA28D4e2742907115fECda335b40dbda07a4C |
| [USDT](https://avascan.info/blockchain/c/token/0x9d228444FC4B7E15A2C481b48E10247A03351FD8)   | 0x9d228444FC4B7E15A2C481b48E10247A03351FD8 |
| [WBTC](https://avascan.info/blockchain/c/token/0x1C0e79C5292c59bbC13C9F9f209D204cf4d65aD6)   | 0x1C0e79C5292c59bbC13C9F9f209D204cf4d65aD6 |
| [WBNB](https://avascan.info/blockchain/c/token/0x442F7f22b1EE2c842bEAFf52880d4573E9201158)   | 0x442F7f22b1EE2c842bEAFf52880d4573E9201158 |
| [WMATIC](https://avascan.info/blockchain/c/token/0xf2f13f0B7008ab2FA4A2418F4ccC3684E49D20Eb) | 0xf2f13f0B7008ab2FA4A2418F4ccC3684E49D20Eb |
| [WAVAX](https://avascan.info/blockchain/c/token/0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7)  | 0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7 |
| [WFTM](https://avascan.info/blockchain/c/token/0xd19abc09B7b36F7558929b97a866f499a26c2f83)   | 0xd19abc09B7b36F7558929b97a866f499a26c2f83 |
| [WCELO](https://avascan.info/blockchain/c/token/0x494317B8521c5a5287a06DEE467dd6fe285dA4a8)  | 0x494317B8521c5a5287a06DEE467dd6fe285dA4a8 |
| [WGLMR](https://avascan.info/blockchain/c/token/0x375aA6C67BF499fBf01804A9f92C03c0776F372d)  | 0x375aA6C67BF499fBf01804A9f92C03c0776F372d |
| [WSUI](https://avascan.info/blockchain/c/token/0x1703CB0F762D2a435199B64Ea47E5349B7C17480)   | 0x1703CB0F762D2a435199B64Ea47E5349B7C17480 |
| [WARB](https://avascan.info/blockchain/c/token/0x2bb3Caf6b5c3a1FE9C4D9BE969B88FB007fE7FBd)   | 0x2bb3Caf6b5c3a1FE9C4D9BE969B88FB007fE7FBd |

#### Fantom

| Symbol                                                                         | Address                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------ |
| [WETH](https://ftmscan.com/token/0x2A126f043BDEBe5A0A9841c51915E562D9B07289)   | 0x2A126f043BDEBe5A0A9841c51915E562D9B07289 |
| [USDC](https://ftmscan.com/token/0x2Ec752329c3EB419136ca5e4432Aa2CDb1eA23e6)   | 0x2Ec752329c3EB419136ca5e4432Aa2CDb1eA23e6 |
| [USDT](https://ftmscan.com/token/0x14BCb86aEed6a74D3452550a25D37f1c30AA0A66)   | 0x14BCb86aEed6a74D3452550a25D37f1c30AA0A66 |
| [WBTC](https://ftmscan.com/token/0x87e9E225aD8a0755B9958fd95BE43DD6A91FF3A7)   | 0x87e9E225aD8a0755B9958fd95BE43DD6A91FF3A7 |
| [WBNB](https://ftmscan.com/token/0xc033551e05907Ddd643AE14b6D4a9CA72BfF509B)   | 0xc033551e05907Ddd643AE14b6D4a9CA72BfF509B |
| [WMATIC](https://ftmscan.com/token/0xb88A6064B1F3FF5B9AE4A82fFD52560b0dF9FBD3) | 0xb88A6064B1F3FF5B9AE4A82fFD52560b0dF9FBD3 |
| [WAVAX](https://ftmscan.com/token/0x358CE030DC6116Cc296E8B9F002728e65459C146)  | 0x358CE030DC6116Cc296E8B9F002728e65459C146 |
| [WFTM](https://ftmscan.com/token/0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83)   | 0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83 |
| [WCELO](https://ftmscan.com/token/0xF432490C6c96C9d3bF523a499a1CEaFd8208A373)  | 0xF432490C6c96C9d3bF523a499a1CEaFd8208A373 |
| [WGLMR](https://ftmscan.com/token/0xBF227E92D6754EB4BFE26C40cb299ff2809Da45f)  | 0xBF227E92D6754EB4BFE26C40cb299ff2809Da45f |
| [WSUI](https://ftmscan.com/token/0xC277423a21F6e32D886BF85Ef6cCB945d5D28347)   | 0xC277423a21F6e32D886BF85Ef6cCB945d5D28347 |
| [WARB](https://ftmscan.com/token/0x07d2bed56ffdab09bfad5911d70be2af26ed010c)   | 0x07d2bed56ffdab09bfad5911d70be2af26ed010c |

#### Celo

| Symbol                                                                                       | Address                                    |
| -------------------------------------------------------------------------------------------- | ------------------------------------------ |
| [WETH](https://explorer.celo.org/mainnet/token/0x66803FB87aBd4aaC3cbB3fAd7C3aa01f6F3FB207)   | 0x66803FB87aBd4aaC3cbB3fAd7C3aa01f6F3FB207 |
| [USDC](https://explorer.celo.org/mainnet/token/0x37f750B7cC259A2f741AF45294f6a16572CF5cAd)   | 0x37f750B7cC259A2f741AF45294f6a16572CF5cAd |
| [USDT](https://explorer.celo.org/mainnet/token/0x617f3112bf5397D0467D315cC709EF968D9ba546)   | 0x617f3112bf5397D0467D315cC709EF968D9ba546 |
| [WBTC](https://explorer.celo.org/mainnet/token/0xd71Ffd0940c920786eC4DbB5A12306669b5b81EF)   | 0xd71Ffd0940c920786eC4DbB5A12306669b5b81EF |
| [WBNB](https://explorer.celo.org/mainnet/token/0xBf2554ce8A4D1351AFeB1aC3E5545AaF7591042d)   | 0xBf2554ce8A4D1351AFeB1aC3E5545AaF7591042d |
| [WMATIC](https://explorer.celo.org/mainnet/token/0x9C234706292b1144133ED509ccc5B3CD193BF712) | 0x9C234706292b1144133ED509ccc5B3CD193BF712 |
| [WAVAX](https://explorer.celo.org/mainnet/token/0xFFdb274b4909fC2efE26C8e4Ddc9fe91963cAA4d)  | 0xFFdb274b4909fC2efE26C8e4Ddc9fe91963cAA4d |
| [WFTM](https://explorer.celo.org/mainnet/token/0xd1A342eE2210238233a347FEd61EE7Faf9f251ce)   | 0xd1A342eE2210238233a347FEd61EE7Faf9f251ce |
| [WCELO](https://explorer.celo.org/mainnet/token/0x471ece3750da237f93b8e339c536989b8978a438)  | 0x471ece3750da237f93b8e339c536989b8978a438 |
| [WGLMR](https://explorer.celo.org/mainnet/token/0x383A5513AbE4Fe36e0E00d484F710148E348Aa9D)  | 0x383A5513AbE4Fe36e0E00d484F710148E348Aa9D |
| [WSUI](https://explorer.celo.org/mainnet/token/0x1Cb9859B1A16A67ef83A0c7b9A21eeC17d9a97Dc)   | 0x1Cb9859B1A16A67ef83A0c7b9A21eeC17d9a97Dc |

#### Moonbeam

| Symbol                                                                                  | Address                                    |
| --------------------------------------------------------------------------------------- | ------------------------------------------ |
| [WETH](https://moonbeam.moonscan.io/token/0xab3f0245B83feB11d15AAffeFD7AD465a59817eD)   | 0xab3f0245B83feB11d15AAffeFD7AD465a59817eD |
| [USDC](https://moonbeam.moonscan.io/token/0x931715FEE2d06333043d11F658C8CE934aC61D0c)   | 0x931715FEE2d06333043d11F658C8CE934aC61D0c |
| [USDT](https://moonbeam.moonscan.io/token/0xc30E9cA94CF52f3Bf5692aaCF81353a27052c46f)   | 0xc30E9cA94CF52f3Bf5692aaCF81353a27052c46f |
| [WBTC](https://moonbeam.moonscan.io/token/0xE57eBd2d67B462E9926e04a8e33f01cD0D64346D)   | 0xE57eBd2d67B462E9926e04a8e33f01cD0D64346D |
| [WBNB](https://moonbeam.moonscan.io/token/0xE3b841C3f96e647E6dc01b468d6D0AD3562a9eeb)   | 0xE3b841C3f96e647E6dc01b468d6D0AD3562a9eeb |
| [WMATIC](https://moonbeam.moonscan.io/token/0x82DbDa803bb52434B1f4F41A6F0Acb1242A7dFa3) | 0x82DbDa803bb52434B1f4F41A6F0Acb1242A7dFa3 |
| [WAVAX](https://moonbeam.moonscan.io/token/0xd4937A95BeC789CC1AE1640714C61c160279B22F)  | 0xd4937A95BeC789CC1AE1640714C61c160279B22F |
| [WFTM](https://moonbeam.moonscan.io/token/0x609AedD990bf45926bca9E4eE988b4Fb98587D3A)   | 0x609AedD990bf45926bca9E4eE988b4Fb98587D3A |
| [WCELO](https://moonbeam.moonscan.io/token/0xc1a792041985F65c17Eb65E66E254DC879CF380b)  | 0xc1a792041985F65c17Eb65E66E254DC879CF380b |
| [WGLMR](https://moonbeam.moonscan.io/token/0xacc15dc74880c9944775448304b263d191c6077f)  | 0xacc15dc74880c9944775448304b263d191c6077f |
| [WSUI](https://moonbeam.moonscan.io/token/0x484eCCE6775143D3335Ed2C7bCB22151C53B9F49)   | 0x484eCCE6775143D3335Ed2C7bCB22151C53B9F49 |

#### Arbitrum

| Symbol                                                                         | Address                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------ |
| [ARB](https://arbiscan.io/token/0x912ce59144191c1204e64559fe8253a0e49e6548)    | 0x912ce59144191c1204e64559fe8253a0e49e6548 |
| [WETH](https://arbiscan.io/token/0x82af49447d8a07e3bd95bd0d56f35241523fbab1)   | 0x82af49447d8a07e3bd95bd0d56f35241523fbab1 |
| [USDC](https://arbiscan.io/token/0xff970a61a04b1ca14834a43f5de4533ebddb5cc8)   | 0xff970a61a04b1ca14834a43f5de4533ebddb5cc8 |
| [USDT](https://arbiscan.io/token/0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9)   | 0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9 |
| [WBTC](https://arbiscan.io/token/0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f)   | 0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f |
| [WBNB](https://arbiscan.io/token/0x8579794b10f88ebbedd3605f2e5ff54f162d4788)   | 0x8579794b10f88ebbedd3605f2e5ff54f162d4788 |
| [WMATIC](https://arbiscan.io/token/0x3ab0e28c3f56616ad7061b4db38ae337e3809aea) | 0x3ab0e28c3f56616ad7061b4db38ae337e3809aea |
| [WAVAX](https://arbiscan.io/token/0x565609faf65b92f7be02468acf86f8979423e514)  | 0x565609faf65b92f7be02468acf86f8979423e514 |
| [WFTM](https://arbiscan.io/token/0x88a23edbb2e49ac3c1b9f9f49ae8d1c26d734fba)   | 0x88a23edbb2e49ac3c1b9f9f49ae8d1c26d734fba |
| [WGLMR](https://arbiscan.io/token/0x944c5b67a03e6cb93ae1e4b70081f13b04cdb6bd)  | 0x944c5b67a03e6cb93ae1e4b70081f13b04cdb6bd |
| [WSUI](https://arbiscan.io/token/0xfe7b5a32c93dc25184d475e3083ba30ed3c1bf8f)   | 0xfe7b5a32c93dc25184d475e3083ba30ed3c1bf8f |

#### SUI

| Symbol                                                                                                                  | Address                                                                          |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [WETH](https://suiexplorer.com/object/0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5?module=coin)   | `0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN` |
| [USDC](https://suiexplorer.com/object/0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf?module=coin)   | `0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN` |
| [USDT](https://suiexplorer.com/object/0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c?module=coin)   | `0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN` |
| [WBTC](https://suiexplorer.com/object/0x27792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881?module=coin)    | `0x27792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN`  |
| [WBNB](https://suiexplorer.com/object/0xb848cce11ef3a8f62eccea6eb5b35a12c4c2b1ee1af7755d02d7bd6218e8226f?module=coin)   | `0xb848cce11ef3a8f62eccea6eb5b35a12c4c2b1ee1af7755d02d7bd6218e8226f::coin::COIN` |
| [WMATIC](https://suiexplorer.com/object/0xdbe380b13a6d0f5cdedd58de8f04625263f113b3f9db32b3e1983f49e2841676?module=coin) | `0xdbe380b13a6d0f5cdedd58de8f04625263f113b3f9db32b3e1983f49e2841676::coin::COIN` |
| [WAVAX](https://suiexplorer.com/object/0x1e8b532cca6569cab9f9b9ebc73f8c13885012ade714729aa3b450e0339ac766?module=coin)  | `0x1e8b532cca6569cab9f9b9ebc73f8c13885012ade714729aa3b450e0339ac766::coin::COIN` |
| [WFTM](https://suiexplorer.com/object/0x6081300950a4f1e2081580e919c210436a1bed49080502834950d31ee55a2396?module=coin)   | `0x6081300950a4f1e2081580e919c210436a1bed49080502834950d31ee55a2396::coin::COIN` |
| [WCELO](https://suiexplorer.com/object/0xa198f3be41cda8c07b3bf3fee02263526e535d682499806979a111e88a5a8d0f?module=coin)  | `0xa198f3be41cda8c07b3bf3fee02263526e535d682499806979a111e88a5a8d0f::coin::COIN` |
| [WGLMR](https://suiexplorer.com/object/0x66f87084e49c38f76502d17f87d17f943f183bb94117561eb573e075fdc5ff75?module=coin)  | `0x66f87084e49c38f76502d17f87d17f943f183bb94117561eb573e075fdc5ff75::coin::COIN` |
| [SUI](https://suiexplorer.com/object/0x0000000000000000000000000000000000000000000000000000000000000002?module=coin)    | 0x2::sui::SUI                                                                    |
