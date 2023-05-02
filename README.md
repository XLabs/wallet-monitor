
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

## Wallet Monitor gRPC service
- Remember to compile gRPC files with `npm run build-grpc`
