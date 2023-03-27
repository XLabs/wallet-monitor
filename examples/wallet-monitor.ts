import { WalletMonitor } from 'wallet-monitor';
import { getLogger } from './helpers';

const cooldown = 1000 * 15; // 15 seconds

const monitor = new WalletMonitor({
  network: 'mainnet',
  chainName: 'ethereum',
  cooldown,
  walletOptions: { logger: getLogger('debug') },
}, [
  // this are 3 random public addresses I got from ether-scan
  {
    address: '0x80C67432656d59144cEFf962E8fAF8926599bCF8',
    tokens: []
  },
  {
    address: '0x8d0d970225597085A59ADCcd7032113226C0419d',
    tokens: []
  },
  {
    address: '0xBd8eDBCad57b5197373309954DD959fCCa40d183',
    tokens: []
  }
]);


monitor.on('balances', (balances) => {
  // Do what you need with your balances
  console.log("Received Balances:", balances);
});


monitor.on('error', (error) => {
  // one of the polling runs failed. The monitor will poll again after "cooldown" time
  console.error("Error:", error);
});

monitor.on('skipped', (skipped) => {
  // a polling run was skipped because the previous one was still running
  console.warn(skipped);
});


monitor.start();


setTimeout(() => {
  monitor.stop();
}, cooldown * 6);
