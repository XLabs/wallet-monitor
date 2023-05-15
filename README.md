
## TL;DR

Wallet Monitor exposes a few utilities to monitor the balance of N wallets in M blockchains. Optionally, you can also monitor the balance of tokens for the wallets.

The module requires near 0 configuration by defaulting most required values to what would be reasonable, but it can be configured more granularly if needed.

The main Modules of the package are:
- `MultiWalletMonitor`: Polls the balances of configured wallets and allows you to react to them using events
- `MultiWalletExporter`: A thin wrapper around the monitor, that automatically updates prometheus metrics with the wallet balances for easy integration with prometheus.


## Multi Wallet Monitor Basic Usage:
```javascript
import { MultiWalletWatcher } from 'wallet-monitor';

const wallets = {
  ethereum: {
    addresses: {
      "0x80C67432656d59144cEFf962E8fAF8926599bCF8": ["USDC", "DAI"],
    },
  },
};

const monitor = new MultiWalletWatcher(wallets);

monitor.on('balances', (chainName, network, allBalances, lastBalance) => {
  // do what you want with your balances.
});


monitor.on('error', (error) => {
  // Handle error as desired
});

monitor.getBalances() // returns current balances for wallets and chains

```
## Multi Wallet Exporter Basic Usage:

```javascript
import { MultiWalletExporter } from 'wallet-monitor';

const wallets = {
  ethereum: {
    addresses: {
      "0x80C67432656d59144cEFf962E8fAF8926599bCF8": ["USDC", "DAI"],
    },
  },
};

const exporter = new MultiWalletExporter(wallets);


exporter.startMetricsServer(); // Starts a prometheus server with the resulting metrics

// Listening to events and getting balances are available just as in MultiWalletWatcher
exporter.on('balances', () => {}) 
exporter.getBalances();
```

### Integrating with an existing prometheus server:
If you already have a server running and don't want to start a new prometheus server, you can get the prometheus registry or the registry metrics from the exporter instance. If you don't call `startMetricsServer`, you will need to call `exporter.start()` in order to start polling for the wallet balances.
Example code:
```
```javascript
import { MultiWalletExporter } from 'wallet-monitor';

const wallets = {
  ethereum: {
    addresses: {
      "0x80C67432656d59144cEFf962E8fAF8926599bCF8": ["USDC", "DAI"],
    },
  },
};

const exporter = new MultiWalletExporter(wallets);

exporter.start(); // Starts a worker that polls for the balances
exporter.metrics(); // Returns prometheus metrics
exporter.getRegistry() // Returns the prometheus registry
```

## Options
`MultiWalletExporter` takes an optional second parameter "options" that allows some configuration on the exporter. Available properties for the object are:
-   `pollInterval`: (optional) the interval (in milliseconds) at which balances will be polled. Default value is 60000 (60 seconds).
-   `logger`: (optional) a logger object that can be used to output logs. Default value is `null`.
-   `prometheus`: (optional) an object with options related to prometheus metrics:
    -   `gaugeName`: (optional) the name of the prometheus gauge that will hold the balance information. Default value is `wallet_monitor_balance`.
    -   `registry`: (optional) a prometheus registry that can be passed if you want to use a custom one.

### `Wallet Options`
The code sample in the `Basic Usage` section is the simplest possible configuration to poll balances of some addresses. Each blockchain connection can be further configured if needed by passing in more properties in the wallets configuration, as such:
```
const wallets = {
  ethereum: {
	// add here options for wallets in the ethereum chain
    addresses: {
      "0x80C67432656d59144cEFf962E8fAF8926599bCF8": ["USDC", "DAI"],
    },
  },
};
```
Each wallet object can have the following properties:

-   `network`: (optional) the network you want to monitor. Default value is the main network of each chain.
-   `chainConfig`: (optional) an object with configuration options for the blockchain you want to monitor wallets in. The options available depend on the type of blockchain being monitored. The available options are defined in `src/wallets/<chain-type>/<chain-name>.config.ts`. You can pass the options you want to override as properties of this object.

### What data will I get?:
Suppose a `wallets` configuration for monitoring that look like this:
```
const wallets = {
  ethereum: {
    addresses: {
      0x80C67432656d59144cEFf962E8fAF8926599bCF8: ['USDC'],
      0x8d0d970225597085A59ADCcd7032113226C0419d: ['DAI'],
      0xBd8eDBCad57b5197373309954DD959fCCa40d183: [],
    }
  }
}
```
This configuration will:
- pull the native balance for all three addresses
- pull the USDC balance for `0x80C67432656d59144cEFf962E8fAF8926599bCF8`
- pull the DAI balance for `0x80C67432656d59144cEFf962E8fAF8926599bCF8`

The return value of `getBalances()` for this example will look like this:
```
{
    "ethereum": {
        "0x80C67432656d59144cEFf962E8fAF8926599bCF8": [
            {
                "isNative": true, // the native balance for this wallet
                "rawBalance": "104032581332177120568",
                "address": "0x80C67432656d59144cEFf962E8fAF8926599bCF8",
                "formattedBalance": "104.032581332177120568",
                "symbol": "ETH"
            },
            {
                "isNative": false, // USDC balance for this wallet
                "rawBalance": "20000000",
                "address": "0x80C67432656d59144cEFf962E8fAF8926599bCF8",
                "formattedBalance": "20.0",
                "symbol": "USDC"
            },

        ],
        "0x8d0d970225597085A59ADCcd7032113226C0419d": [
            {
                "isNative": true, // the native balance for this wallet
                "rawBalance": "60372718604099355",
                "address": "0x8d0d970225597085A59ADCcd7032113226C0419d",
                "formattedBalance": "0.060372718604099355",
                "symbol": "ETH"
            },
            {
                "isNative": false, // DAI balance for this wallet
                "rawBalance": "2000600180000000000",
                "address": "0x80C67432656d59144cEFf962E8fAF8926599bCF8",
                "formattedBalance": "2.00060018",
                "symbol": "DAI"
            }
        ],
        "0xBd8eDBCad57b5197373309954DD959fCCa40d183": [
            {
                "isNative": true, // Native balance for this wallet
                "rawBalance": "2380949603180521",
                "address": "0xBd8eDBCad57b5197373309954DD959fCCa40d183",
                "formattedBalance": "0.002380949603180521",
                "symbol": "ETH"
            }
            // no tokens were configured for this wallet
        ]
    }
}
```

### Supported Tokens

While you can pass any token address to the wallet monitor, for simplicity a list of supported tokens is provided so you can use their symbols instead. See the table below:

#### Ethereum

| Symbol | Address |
| ------ | ------- |
| [WETH](https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2) | 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 |
| [USDC](https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48) | 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 |
| [USDT](https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7) | 0xdac17f958d2ee523a2206206994597c13d831ec7 |
| [WBTC](https://etherscan.io/token/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599) | 0x2260fac5e5542a773aa44fbcfedf7c193bc2c599 |
| [WBNB](https://etherscan.io/token/0x418D75f65a02b3D53B2418FB8E1fe493759c7605) | 0x418D75f65a02b3D53B2418FB8E1fe493759c7605 |
| [WMATIC](https://etherscan.io/token/0x7c9f4C87d911613Fe9ca58b579f737911AAD2D43) | 0x7c9f4C87d911613Fe9ca58b579f737911AAD2D43 |
| [WAVAX](https://etherscan.io/token/0x85f138bfEE4ef8e540890CFb48F620571d67Eda3) | 0x85f138bfEE4ef8e540890CFb48F620571d67Eda3 |
| [WFTM](https://etherscan.io/token/0x4cD2690d86284e044cb63E60F1EB218a825a7e92) | 0x4cD2690d86284e044cb63E60F1EB218a825a7e92 |
| [WCELO](https://etherscan.io/token/0x3294395e62f4eb6af3f1fcf89f5602d90fb3ef69) | 0x3294395e62f4eb6af3f1fcf89f5602d90fb3ef69 |
| [WGLMR](https://etherscan.io/token/0x93d3696A9F879b331f40CB5059e37015423A3Bd0) | 0x93d3696A9F879b331f40CB5059e37015423A3Bd0 |
| [WSUI](https://etherscan.io/token/0x84074EA631dEc7a4edcD5303d164D5dEa4c653D6) | 0x84074EA631dEc7a4edcD5303d164D5dEa4c653D6 |

#### Binance Smart Chain

| Symbol | Address |
|--------|---------|
| [WETH](https://bscscan.com/token/0x4db5a66e937a9f4473fa95b1caf1d1e1d62e29ea) | 0x4db5a66e937a9f4473fa95b1caf1d1e1d62e29ea |
| [USDC](https://bscscan.com/token/0xB04906e95AB5D797aDA81508115611fee694c2b3) | 0xB04906e95AB5D797aDA81508115611fee694c2b3 |
| [USDT](https://bscscan.com/token/0x524bC91Dc82d6b90EF29F76A3ECAaBAffFD490Bc) | 0x524bC91Dc82d6b90EF29F76A3ECAaBAffFD490Bc |
| [WBTC](https://bscscan.com/token/0x43359676e1a3f9fbb5de095333f8e9c1b46dfa44) | 0x43359676e1a3f9fbb5de095333f8e9c1b46dfa44 |
| [WBNB](https://bscscan.com/token/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c) | 0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c |
| [WMATIC](https://bscscan.com/token/0xc836d8dC361E44DbE64c4862D55BA041F88Ddd39) | 0xc836d8dC361E44DbE64c4862D55BA041F88Ddd39 |
| [WAVAX](https://bscscan.com/token/0x96412902aa9aFf61E13f085e70D3152C6ef2a817) | 0x96412902aa9aFf61E13f085e70D3152C6ef2a817 |
| [WFTM](https://bscscan.com/token/0xbF8413EE8612E0E4f66Aa63B5ebE27f3C5883d47) | 0xbF8413EE8612E0E4f66Aa63B5ebE27f3C5883d47 |
| [WCELO](https://bscscan.com/token/0x2A335e327a55b177f5B40132fEC5D7298aa0D7e6) | 0x2A335e327a55b177f5B40132fEC5D7298aa0D7e6 |
| [WGLMR](https://bscscan.com/token/0x1C063db3c621BF901FC6C1D03328b08b2F9bbfba) | 0x1C063db3c621BF901FC6C1D03328b08b2F9bbfba |
| [WSUI](https://bscscan.com/token/0x8314f6Bf1B4dd8604A0fC33C84F9AF2fc07AABC8) | 0x8314f6Bf1B4dd8604A0fC33C84F9AF2fc07AABC8 |

#### Polygon

Here's the markdown table with the information you provided:

| Symbol | Address |
|--------|---------|
| [WETH](https://polygonscan.com/token/0x11CD37bb86F65419713f30673A480EA33c826872) | 0x11CD37bb86F65419713f30673A480EA33c826872 |
| [USDC](https://polygonscan.com/token/0x4318CB63A2b8edf2De971E2F17F77097e499459D) | 0x4318CB63A2b8edf2De971E2F17F77097e499459D |
| [USDT](https://polygonscan.com/token/0x9417669fbf23357d2774e9d421307bd5ea1006d2) | 0x9417669fbf23357d2774e9d421307bd5ea1006d2 |
| [WBTC](https://polygonscan.com/token/0x5d49c278340655b56609fdf8976eb0612af3a0c3) | 0x5d49c278340655b56609fdf8976eb0612af3a0c3 |
| [WBNB](https://polygonscan.com/token/0xeCDCB5B88F8e3C15f95c720C51c71c9E2080525d) | 0xeCDCB5B88F8e3C15f95c720C51c71c9E2080525d |
| [WMATIC](https://polygonscan.com/token/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270) | 0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270 |
| [WAVAX](https://polygonscan.com/token/0x7Bb11E7f8b10E9e571E5d8Eace04735fDFB2358a) | 0x7Bb11E7f8b10E9e571E5d8Eace04735fDFB2358a |
| [WFTM](https://polygonscan.com/token/0x3726831304D77f585f1Aca9d9841cc3Ef80dAa62) | 0x3726831304D77f585f1Aca9d9841cc3Ef80dAa62 |
| [WCELO](https://polygonscan.com/token/0x922F49a9911effc034eE756196E59BE7b90D43b3) | 0x922F49a9911effc034eE756196E59BE7b90D43b3 |
| [WGLMR](https://polygonscan.com/token/0xcC48d6CF842083fEc0E01d913fB964b585975F05) | 0xcC48d6CF842083fEc0E01d913fB964b585975F05 |
| [WSUI](https://polygonscan.com/token/0x34bE049fEbfc6C64Ffd82Da08a8931A9a45f2cc8) | 0x34bE049fEbfc6C64Ffd82Da08a8931A9a45f2cc8 |

#### Avalanche

Apologies for the mistake. Here's the corrected markdown table with links on the symbol column:

| Symbol | Address |
| ------ | ------- |
| [WETH](https://avascan.info/blockchain/c/token/0x8b82A291F83ca07Af22120ABa21632088fC92931) | 0x8b82A291F83ca07Af22120ABa21632088fC92931 |
| [USDC](https://avascan.info/blockchain/c/token/0xB24CA28D4e2742907115fECda335b40dbda07a4C) | 0xB24CA28D4e2742907115fECda335b40dbda07a4C |
| [USDT](https://avascan.info/blockchain/c/token/0x9d228444FC4B7E15A2C481b48E10247A03351FD8) | 0x9d228444FC4B7E15A2C481b48E10247A03351FD8 |
| [WBTC](https://avascan.info/blockchain/c/token/0x1C0e79C5292c59bbC13C9F9f209D204cf4d65aD6) | 0x1C0e79C5292c59bbC13C9F9f209D204cf4d65aD6 |
| [WBNB](https://avascan.info/blockchain/c/token/0x442F7f22b1EE2c842bEAFf52880d4573E9201158) | 0x442F7f22b1EE2c842bEAFf52880d4573E9201158 |
| [WMATIC](https://avascan.info/blockchain/c/token/0xf2f13f0B7008ab2FA4A2418F4ccC3684E49D20Eb) | 0xf2f13f0B7008ab2FA4A2418F4ccC3684E49D20Eb |
| [WAVAX](https://avascan.info/blockchain/c/token/0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7) | 0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7 |
| [WFTM](https://avascan.info/blockchain/c/token/0xd19abc09B7b36F7558929b97a866f499a26c2f83) | 0xd19abc09B7b36F7558929b97a866f499a26c2f83 |
| [WCELO](https://avascan.info/blockchain/c/token/0x494317B8521c5a5287a06DEE467dd6fe285dA4a8) | 0x494317B8521c5a5287a06DEE467dd6fe285dA4a8 |
| [WGLMR](https://avascan.info/blockchain/c/token/0x375aA6C67BF499fBf01804A9f92C03c0776F372d) | 0x375aA6C67BF499fBf01804A9f92C03c0776F372d |
| [WSUI](https://avascan.info/blockchain/c/token/0x1703CB0F762D2a435199B64Ea47E5349B7C17480) | 0x1703CB0F762D2a435199B64Ea47E5349B7C17480 |

#### Fantom

Sure! Here's the markdown table:

| Symbol | Address                                          |
|--------|--------------------------------------------------|
| [WETH](https://ftmscan.com/token/0x2A126f043BDEBe5A0A9841c51915E562D9B07289) | 0x2A126f043BDEBe5A0A9841c51915E562D9B07289 |
| [USDC](https://ftmscan.com/token/0x2Ec752329c3EB419136ca5e4432Aa2CDb1eA23e6) | 0x2Ec752329c3EB419136ca5e4432Aa2CDb1eA23e6 |
| [USDT](https://ftmscan.com/token/0x14BCb86aEed6a74D3452550a25D37f1c30AA0A66) | 0x14BCb86aEed6a74D3452550a25D37f1c30AA0A66 |
| [WBTC](https://ftmscan.com/token/0x87e9E225aD8a0755B9958fd95BE43DD6A91FF3A7) | 0x87e9E225aD8a0755B9958fd95BE43DD6A91FF3A7 |
| [WBNB](https://ftmscan.com/token/0xc033551e05907Ddd643AE14b6D4a9CA72BfF509B) | 0xc033551e05907Ddd643AE14b6D4a9CA72BfF509B |
| [WMATIC](https://ftmscan.com/token/0xb88A6064B1F3FF5B9AE4A82fFD52560b0dF9FBD3) | 0xb88A6064B1F3FF5B9AE4A82fFD52560b0dF9FBD3 |
| [WAVAX](https://ftmscan.com/token/0x358CE030DC6116Cc296E8B9F002728e65459C146) | 0x358CE030DC6116Cc296E8B9F002728e65459C146 |
| [WFTM](https://ftmscan.com/token/0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83) | 0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83 |
| [WCELO](https://ftmscan.com/token/0xF432490C6c96C9d3bF523a499a1CEaFd8208A373) | 0xF432490C6c96C9d3bF523a499a1CEaFd8208A373 |
| [WGLMR](https://ftmscan.com/token/0xBF227E92D6754EB4BFE26C40cb299ff2809Da45f) | 0xBF227E92D6754EB4BFE26C40cb299ff2809Da45f |
| [WSUI](https://ftmscan.com/token/0xC277423a21F6e32D886BF85Ef6cCB945d5D28347) | 0xC277423a21F6e32D886BF85Ef6cCB945d5D28347 |

#### Celo

Here's the markdown table with the requested information:

| Symbol | Address |
| ------ | ------- |
| [WETH](https://explorer.celo.org/mainnet/token/0x66803FB87aBd4aaC3cbB3fAd7C3aa01f6F3FB207) | 0x66803FB87aBd4aaC3cbB3fAd7C3aa01f6F3FB207 |
| [USDC](https://explorer.celo.org/mainnet/token/0x37f750B7cC259A2f741AF45294f6a16572CF5cAd) | 0x37f750B7cC259A2f741AF45294f6a16572CF5cAd |
| [USDT](https://explorer.celo.org/mainnet/token/0x617f3112bf5397D0467D315cC709EF968D9ba546) | 0x617f3112bf5397D0467D315cC709EF968D9ba546 |
| [WBTC](https://explorer.celo.org/mainnet/token/0xd71Ffd0940c920786eC4DbB5A12306669b5b81EF) | 0xd71Ffd0940c920786eC4DbB5A12306669b5b81EF |
| [WBNB](https://explorer.celo.org/mainnet/token/0xBf2554ce8A4D1351AFeB1aC3E5545AaF7591042d) | 0xBf2554ce8A4D1351AFeB1aC3E5545AaF7591042d |
| [WMATIC](https://explorer.celo.org/mainnet/token/0x9C234706292b1144133ED509ccc5B3CD193BF712) | 0x9C234706292b1144133ED509ccc5B3CD193BF712 |
| [WAVAX](https://explorer.celo.org/mainnet/token/0xFFdb274b4909fC2efE26C8e4Ddc9fe91963cAA4d) | 0xFFdb274b4909fC2efE26C8e4Ddc9fe91963cAA4d |
| [WFTM](https://explorer.celo.org/mainnet/token/0xd1A342eE2210238233a347FEd61EE7Faf9f251ce) | 0xd1A342eE2210238233a347FEd61EE7Faf9f251ce |
| [WCELO](https://explorer.celo.org/mainnet/token/0x471ece3750da237f93b8e339c536989b8978a438) | 0x471ece3750da237f93b8e339c536989b8978a438 |
| [WGLMR](https://explorer.celo.org/mainnet/token/0x383A5513AbE4Fe36e0E00d484F710148E348Aa9D) | 0x383A5513AbE4Fe36e0E00d484F710148E348Aa9D |
| [WSUI](https://explorer.celo.org/mainnet/token/0x1Cb9859B1A16A67ef83A0c7b9A21eeC17d9a97Dc) | 0x1Cb9859B1A16A67ef83A0c7b9A21eeC17d9a97Dc |

#### Moonbeam

You're right, my apologies for the confusion. Here's the corrected markdown table with the links in the first column:

| Symbol | Address                                    |
|--------|--------------------------------------------|
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
| [WSUI](https://moonbeam.moonscan.io/token/0x484eCCE6775143D3335Ed2C7bCB22151C53B9F49)  | 0x484eCCE6775143D3335Ed2C7bCB22151C53B9F49 |

#### SUI

| Symbol | Address |
|--------|---------|
| [WETH](https://suiexplorer.com/object/0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5?module=coin) | 0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN |
| [USDC](https://suiexplorer.com/object/0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf?module=coin) | 0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN |
| [USDT](https://suiexplorer.com/object/0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c?module=coin) | 0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN |
| [WBTC](https://suiexplorer.com/object/0x27792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881?module=coin) | 0x27792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN |
| [WBNB](https://suiexplorer.com/object/0xb848cce11ef3a8f62eccea6eb5b35a12c4c2b1ee1af7755d02d7bd6218e8226f?module=coin) | 0xb848cce11ef3a8f62eccea6eb5b35a12c4c2b1ee1af7755d02d7bd6218e8226f::coin::COIN |
| [WMATIC](https://suiexplorer.com/object/0xdbe380b13a6d0f5cdedd58de8f04625263f113b3f9db32b3e1983f49e2841676?module=coin) | 0xdbe380b13a6d0f5cdedd58de8f04625263f113b3f9db32b3e1983f49e2841676::coin::COIN |
| [WAVAX](https://suiexplorer.com/object/0x1e8b532cca6569cab9f9b9ebc73f8c13885012ade714729aa3b450e0339ac766?module=coin) | 0x1e8b532cca6569cab9f9b9ebc73f8c13885012ade714729aa3b450e0339ac766::coin::COIN |
| [WFTM](https://suiexplorer.com/object/0x6081300950a4f1e2081580e919c210436a1bed49080502834950d31ee55a2396?module=coin) | 0x6081300950a4f1e2081580e919c210436a1bed49080502834950d31ee55a2396::coin::COIN |
| [WCELO](https://suiexplorer.com/object/0xa198f3be41cda8c07b3bf3fee02263526e535d682499806979a111e88a5a8d0f?module=coin) | 0xa198f3be41cda8c07b3bf3fee02263526e535d682499806979a111e88a5a8d0f::coin::COIN |
| [WGLMR](https://suiexplorer.com/object/0x66f87084e49c38f76502d17f87d17f943f183bb94117561eb573e075fdc5ff75?module=coin) | 0x66f87084e49c38f76502d17f87d17f943f183bb94117561eb573e075fdc5ff75::coin::COIN |
| [SUI](https://suiexplorer.com/object/0x0000000000000000000000000000000000000000000000000000000000000002?module=coin) | 0x2::sui::SUI |