import { WalletExporter } from 'wallet-monitor';

// Chain Config is exactly the same as the one used in the wallet-monitor example.
// see file: examples/wallet-monitor.ts
const chainConfig = { network: 'mainnet', chainName: 'ethereum' };

// Wallets to monitor is exactly the same as the one used in the wallet-monitor example.
// see file: examples/wallet-monitor.ts
const walletsToMonitor = [
  {
    address: '0x80C67432656d59144cEFf962E8fAF8926599bCF8',
    tokens: ['UsDc', 'DaI']
  },
  {
    address: '0x8d0d970225597085A59ADCcd7032113226C0419d',
    tokens: []
  },
  {
    address: '0xBd8eDBCad57b5197373309954DD959fCCa40d183',
    tokens: []
  }
];

// prometheusOptions are optional
const prometheusOptions = {
  // the name of the prometheus gauge. Defaults to: 'wallet_monitor_balances'
  // gaugeName: 'my_custom_gauge_name',
};

const monitor = new WalletExporter(chainConfig, walletsToMonitor, prometheusOptions);

/**
 * If your application already is already collecting metrics from the prometheus 
 * register, this step is not necessary and you should only call `monitor.start()` instead (see below)
 * 
 * The wallet monitor will be started automatically, no need to call monitor.start()  when 
 * using this method. You can see the metrics definitions in the file: src/prometheus-wallet-monitor.ts
 * or visit: http://localhost:3002/my-metrics-path
 */
monitor.startMetricsServer(
  // the port to serve metrics on. Defaults to 3001
  3002,

  // the path to serve metrics on. Defaults to '/metrics'
  '/my-metrics-path',
);

/***
 * If your application already has a server running that you want to reuse, you can
 * use `monitor.metrics()` to serve metrics your self. For example:
 * 
 * const express = require('express');
 * const app = express();
 * 
 * app.get('/my-metrics-path', (req, res) => {
 *   res.send(monitor.metrics());
 * });
 */
