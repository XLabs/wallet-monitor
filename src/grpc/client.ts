import {ChainWalletManager, WalletExecuteOptions, WithWalletExecutor} from "../chain-wallet-manager";
import {ChainName, isChain} from "../wallets";
import {getDefaultNetwork, WalletManagerConfig, WalletManagerOptions} from "../wallet-manager";
import winston from "winston";
import {createLogger} from "../utils";
import {IClientWalletManager} from "../i-wallet-manager";
import {createChannel, createClient} from "nice-grpc";
import {
    WalletManagerGRPCServiceDefinition
} from "./out/wallet-manager-grpc-service";

export class ClientWalletManager implements IClientWalletManager {
    private walletManagerGRPCChannel;
    private walletManagerGRPCClient;
    private managers;

    protected logger: winston.Logger;

    constructor(private host: string, private port: number, rawConfig: WalletManagerConfig, options?: WalletManagerOptions) {
        this.logger = createLogger(options?.logger, options?.logLevel, { label: 'WalletManager' });
        this.managers = {} as Record<ChainName, ChainWalletManager>;

        // this.walletManagerGRPCClient = new WalletManagerProtocol(`${host}:${port}`, grpc.credentials.createInsecure())
        this.walletManagerGRPCChannel = createChannel(`${host}:${port}`)
        this.walletManagerGRPCClient = createClient(WalletManagerGRPCServiceDefinition, this.walletManagerGRPCChannel)

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

            this.managers[chainName] = new ChainWalletManager(chainManagerConfig, config.wallets);
        }
    }

    public async withWallet(chainName: ChainName, fn: WithWalletExecutor, opts?: WalletExecuteOptions): Promise<void> {
        const chainManager = this.managers[chainName];
        if (!chainManager) throw new Error(`No wallets configured for chain: ${chainName}`);

        const { address: acquiredAddress } = await this.walletManagerGRPCClient.acquireLock({chainName, address: opts?.address, leaseTimeout: opts?.leaseTimeout})

        // FIXME
        // Dirty solution. We are doing as little work as possible to get the same expected WalletInterface after
        //  locking.
        // Unfortunately this is not only inefficient (we lock 2 times) but also nonsense because, if we successfully
        //  locked a particular address in the wallet manager service, it's impossible that we have it locked here.
        // Nevertheless, this should allow us to just make it work right now.
        const acquiredWallet = await this.managers[chainName].acquireLock({...opts, address: acquiredAddress});

        try {
            return fn(acquiredWallet);
        } catch (error) {
            this.logger.error('The workflow function failed to run within the context of the acquired wallet.', error);
            throw error;
        } finally {
            await Promise.all([
                this.walletManagerGRPCClient.releaseLock({chainName, address: acquiredAddress}),
                this.managers[chainName].releaseLock(acquiredAddress)
            ]);
        }
    }
}
