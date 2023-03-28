import { PrometheusWalletMonitor } from 'wallet-monitor';

const chainConfig = { network: 'mainnet', chainName: 'ethereum' };

const walletsToMonitor = [
  // these are 3 random public addresses I got from ether-scan
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

// right now all prometheus options (this parameter included) are optional.
const prometheusOptions = {
  // the name of the prometheus gauge. Defaults to: 'wallet_monitor_balances'
  // gaugeName: 'my-custom-gauge-name',
};

const monitor = new PrometheusWalletMonitor(chainConfig, walletsToMonitor, prometheusOptions);

// this will serve metrics in port 3001 and path /metrics
// port and path can be passed as parameters to override the defaults
monitor.startMetricsServer();
