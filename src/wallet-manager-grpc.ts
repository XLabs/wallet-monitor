import {SingleWalletManager, WalletExecuteOptions, WithWalletExecutor} from "./single-wallet-manager";
import {ChainName, isChain} from "./wallets";
import { credentials } from '@grpc/grpc-js';
import {getDefaultNetwork, WalletManagerConfig, WalletManagerOptions} from "./wallet-manager";
import winston from "winston";
import {createLogger} from "./utils";
const { AcquireLockRequest, ReleaseLockRequest } = require('wallet-manager-grpc/wallet-manager_pb');
const { WalletManagerClient } = require('wallet-manager-grpc');

export class WalletManagerGrpc {
    /**
     * Class that is similar but not equivalent to a WalletManager.
     * In this case where WalletManager is spawned within a separate service, we don't need to read
     *  from events, expose balances, expose errors.
     * This class basically just provides a way to get a locked wallet for a specific chain.
     */
    private grpcClientStub: any;
    private managers;

    protected logger: winston.Logger;

    constructor(private path: string, private port: number, rawConfig: WalletManagerConfig, options?: WalletManagerOptions) {
        this.logger = createLogger(options?.logger, options?.logLevel, { label: 'WalletManager' });
        this.managers = {} as Record<ChainName, SingleWalletManager>;

        this.grpcClientStub = new WalletManagerClient(`${path}:${port}`, credentials.createInsecure())

        // Constructing a record of manager for the only purpose of extracting the appropriate provider and private key
        //  to bundle together with the lock acquired from the grpc service.
        for (const [chainName, config] of Object.entries(rawConfig)) {
            if (!isChain(chainName)) throw new Error(`Invalid chain name: ${chainName}`);
            const network = config.network || getDefaultNetwork(chainName);

            const chainManagerConfig = {
                network,
                chainName,
                logger: this.logger,
                rebalance: {...config.rebalance, enabled: false},
                walletOptions: config.chainConfig,
            };

            this.managers[chainName] = new SingleWalletManager(chainManagerConfig, config.wallets);
        }
    }

    public async withWallet(chainName: ChainName, fn: WithWalletExecutor, opts?: WalletExecuteOptions): Promise<void> {
        const chainManager = this.managers[chainName];
        if (!chainManager) throw new Error(`No wallets configured for chain: ${chainName}`)

        const acquireResponse = await this.grpcClientStub.acquireLock({chainName, address: opts?.address, leaseTimeout: opts?.leaseTimeout}, (error: any, res: any) => {
            return res
        });

        // FIXME
        // Dirty solution. We are doing as little work as possible to get the same expected WalletInterface after
        //  locking.
        // Unfortunately this is not only inefficient (we lock 2 times) but also nonsense because, if we successfully
        //  locked a particular address in the wallet manager service, it's impossible that we have it locked here.
        // Nevertheless, this should allow us to just make it work right now.
        const acquiredWallet = await this.managers[chainName].acquireLock({...opts, address: acquireResponse.address})

        try {
            return fn(acquiredWallet);
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            await Promise.all([
                await this.grpcClientStub.releaseLock({chainName, address: acquireResponse.address}, () => {}),
                await this.managers[chainName].releaseLock(acquireResponse.address)
            ])
        }
    }
}