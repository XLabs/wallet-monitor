import {
  ChainWalletManager,
  WalletBalancesByAddress,
  WalletExecuteOptions,
  WithWalletExecutor,
} from "../chain-wallet-manager";
import { ChainName, isChain } from "../wallets";
import {
  getDefaultNetwork,
  WalletManagerConfig,
  WalletManagerOptions,
} from "../wallet-manager";
import winston from "winston";
import { createLogger, mapConcurrent } from "../utils";
import { IClientWalletManager } from "../i-wallet-manager";
import { createChannel, createClient } from "nice-grpc";
import { WalletManagerGRPCServiceDefinition } from "./out/wallet-manager-grpc-service";

export class ClientWalletManager implements IClientWalletManager {
  private walletManagerGRPCChannel;
  private walletManagerGRPCClient;
  private managers;

  protected logger: winston.Logger;

  constructor(
    private host: string,
    private port: number,
    config: WalletManagerConfig,
    options?: WalletManagerOptions,
  ) {
    this.logger = createLogger(options?.logger, options?.logLevel, {
      label: "WalletManager",
    });
    this.managers = {} as Record<ChainName, ChainWalletManager>;

    this.walletManagerGRPCChannel = createChannel(`${host}:${port}`);
    this.walletManagerGRPCClient = createClient(
      WalletManagerGRPCServiceDefinition,
      this.walletManagerGRPCChannel,
    );

    // Constructing a record of manager for the only purpose of extracting the appropriate provider and private key
    //  to bundle together with the lock acquired from the grpc service.
    for (const [chainName, chainConfig] of Object.entries(config)) {
      if (!isChain(chainName))
        throw new Error(`Invalid chain name: ${chainName}`);
      const network = chainConfig.network || getDefaultNetwork(chainName);

      const chainManagerConfig = {
        network,
        chainName,
        logger: this.logger,
        rebalance: { ...chainConfig.rebalance, enabled: false },
        walletOptions: chainConfig.chainConfig,
      };

      this.managers[chainName] = new ChainWalletManager(
        chainManagerConfig,
        chainConfig.wallets,
      );
    }
  }

  public async withWallet(
    chainName: ChainName,
    fn: WithWalletExecutor,
    opts?: WalletExecuteOptions,
  ): Promise<void> {
    const chainManager = this.managers[chainName];
    if (!chainManager)
      throw new Error(`No wallets configured for chain: ${chainName}`);

    const { address: acquiredAddress } =
      await this.walletManagerGRPCClient.acquireLock({
        chainName,
        address: opts?.address,
        leaseTimeout: opts?.leaseTimeout,
        acquireTimeout: opts?.waitToAcquireTimeout,
      });

    // FIXME
    // Dirty solution. We are doing as little work as possible to get the same expected WalletInterface after
    //  locking.
    // Unfortunately this is not only inefficient (we lock 2 times) but also nonsense because, if we successfully
    //  locked a particular address in the wallet manager service, it's impossible that we have it locked here.
    // Nevertheless, this should allow us to just make it work right now.
    const acquiredWallet = await this.managers[chainName].acquireLock({
      ...opts,
      address: acquiredAddress,
    });

    try {
      return await fn(acquiredWallet);
    } catch (error) {
      this.logger.error(
        "The workflow function failed to run within the context of the acquired wallet.",
        error,
      );
      throw error;
    } finally {
      await Promise.all([
        this.walletManagerGRPCClient.releaseLock({
          chainName,
          address: acquiredAddress,
        }),
        this.managers[chainName].releaseLock(acquiredAddress),
      ]);
    }
  }

  public getBlockHeight(chainName: ChainName): Promise<number> {
    const manager = this.managers[chainName];
    if (!manager)
      throw new Error(`No wallets configured for chain: ${chainName}`);

    return manager.getBlockHeight();
  }

  private async balanceHandlerMapper(method: "getBalances" | "pullBalances") {
    const balances: Record<string, WalletBalancesByAddress> = {};

    await mapConcurrent(
      Object.entries(this.managers),
      async ([chainName, manager]) => {
        const balancesByChain = await manager[method]();
        balances[chainName] = balancesByChain;
      },
    );

    return balances;
  }

  // PullBalances doesn't need balances to be refreshed in the background
  public async pullBalances(): Promise<
    Record<string, WalletBalancesByAddress>
  > {
    return await this.balanceHandlerMapper("pullBalances");
  }

  private validateBlockHeightByChain(
    blockHeightByChain: Record<ChainName, number>,
  ) {
    for (const chain in blockHeightByChain) {
      const manager = this.managers[chain as ChainName];
      if (!manager)
        throw new Error(`No wallets configured for chain: ${chain}`);
    }
  }

  public async getBlockHeightForAllSupportedChains(): Promise<
    Record<ChainName, number>
  > {
    // Required concurrency is the number of chains as we want to fetch the block height for all chains in parallel
    // to be precise about the block height at the time of fetching balances
    let blockHeightPerChain = {} as Record<ChainName, number>;
    const requiredConcurrency = Object.keys(this.managers).length;
    await mapConcurrent(
      Object.entries(this.managers),
      async ([chainName, manager]) => {
        try {
          const blockHeight = await manager.getBlockHeight();          
          blockHeightPerChain = {
            ...blockHeightPerChain,
            [chainName]: blockHeight,
          } as Record<ChainName, number>;
        } catch (err) {
          throw new Error(`No block height found for chain: ${chainName}, error: ${err}`);
        }
      },
      requiredConcurrency,
    );
    return blockHeightPerChain;
  }

  // pullBalancesAtBlockHeight doesn't need balances to be refreshed in the background
  public async pullBalancesAtBlockHeight(
    blockHeightByChain?: Record<ChainName, number>,
  ): Promise<Record<string, WalletBalancesByAddress>> {
    const balances: Record<string, WalletBalancesByAddress> = {};
    if (blockHeightByChain) {
      this.validateBlockHeightByChain(blockHeightByChain);
    }

    const blockHeightPerChain = blockHeightByChain ?? await this.getBlockHeightForAllSupportedChains();

    await mapConcurrent(
      Object.entries(this.managers),
      async ([chainName, manager]) => {
        const blockHeight = blockHeightPerChain[chainName as ChainName];
        const balancesByChain = await manager.pullBalancesAtBlockHeight(
          blockHeight,
        );
        balances[chainName] = balancesByChain;
      },
    );

    return balances;
  }

  public async pullBalancesAtCurrentBlockHeight(): Promise<Record<string, WalletBalancesByAddress>> {
    throw new Error("Method not implemented.");
  }
}
