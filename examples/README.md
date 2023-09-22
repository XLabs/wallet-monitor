# Steps to test wallet-monitor metrics on prometheus and build grafana dashboard

- First run `docker-compose` to run grafana and prometheus locally
- Run network simulator from either ganache or hardhat
- Run `npm run rebalancing` to test metrics with the required config
