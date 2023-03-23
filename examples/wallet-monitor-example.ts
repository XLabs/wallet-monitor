import { WalletMonitor } from 'wallet-monitor';

const cooldown = 1000 * 30; // 30 seconds

const monitor = new WalletMonitor({
  network: 'mainnet',
  chainName: 'ethereum',
  cooldown: 1000 * 60 * 5,
  walletOptions: { nodeUrl: 'https://mainnet.infura.io/v3/...' },
}, [
  {
    address: '0x...',
    tokens: ['0x...', 'USDC']
  },
  {
    address: '0x...',
    tokens: ['0x...', 'USDC']
  },
]);


monitor.on('balances', (balances) => {
  // Do what you need with your balances
  console.log(balances);
});


monitor.on('error', (error) => {
  // one of the polling runs failed. The monitor will poll again after "cooldown" time
  console.error(error);
});

monitor.on('skipped', (skipped) => {
  // a polling run was skipped because the previous one was still running
  console.warn(skipped);
});


monitor.start();


setTimeout(() => {
  monitor.stop();
}, cooldown * 6);

