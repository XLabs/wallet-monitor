"use strict";

import { FeeData } from "@ethersproject/abstract-provider";
import {
  BigNumber,
  BigNumberish,
  BytesLike,
  Transaction,
  ethers,
  version,
} from "ethers";
import {
  AccessListish,
  Deferrable,
  Logger,
  isHexString,
} from "ethers/lib/utils";

const logger = new Logger(version);

type NextItemFunc<T> = () => T;

const itemCycler = <T>(list: T[]) => {
  let currentElement: number = 0;

  return (): T => {
    const pick = list[currentElement];
    currentElement = ++currentElement % list.length;

    return pick;
  };
};

function deepCopy<T>(object: T): T {
  return _deepCopy(object);
}

const opaque: { [key: string]: boolean } = {
  bigint: true,
  boolean: true,
  function: true,
  number: true,
  string: true,
};

interface Filter extends EventFilter {
  fromBlock?: BlockTag;
  toBlock?: BlockTag;
}

function _isFrozen(object: any): boolean {
  // Opaque objects are not mutable, so safe to copy by assignment
  if (object === undefined || object === null || opaque[typeof object]) {
    return true;
  }

  if (Array.isArray(object) || typeof object === "object") {
    if (!Object.isFrozen(object)) {
      return false;
    }

    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
      let value: any = null;
      try {
        value = object[keys[i]];
      } catch (error) {
        // If accessing a value triggers an error, it is a getter
        // designed to do so (e.g. Result) and is therefore "frozen"
        continue;
      }

      if (!_isFrozen(value)) {
        return false;
      }
    }

    return true;
  }

  return logger.throwArgumentError(
    `Cannot deepCopy ${typeof object}`,
    "object",
    object,
  );
}

function defineReadOnly<T, K extends keyof T>(
  object: T,
  name: K,
  value: T[K],
): void {
  Object.defineProperty(object, name, {
    enumerable: true,
    value: value,
    writable: false,
  });
}

function _deepCopy(object: any): any {
  if (_isFrozen(object)) {
    return object;
  }

  // Arrays are mutable, so we need to create a copy
  if (Array.isArray(object)) {
    return Object.freeze(object.map(item => deepCopy(item)));
  }

  if (typeof object === "object") {
    const result: { [key: string]: any } = {};
    for (const key in object) {
      const value = object[key];
      if (value === undefined) {
        continue;
      }
      defineReadOnly(result, key, deepCopy(value));
    }

    return result;
  }

  return logger.throwArgumentError(
    `Cannot deepCopy ${typeof object}`,
    "object",
    object,
  );
}

class Description<T = any> {
  constructor(info: { [K in keyof T]: T[K] }) {
    for (const key in info) {
      (<any>this)[key] = deepCopy(info[key]);
    }
  }
}

abstract class ForkEvent extends Description {
  readonly expiry: number = 0;

  readonly _isForkEvent?: boolean;

  static isForkEvent(value: any): value is ForkEvent {
    return !!(value && value._isForkEvent);
  }
}

class BlockForkEvent extends ForkEvent {
  readonly blockHash: string = "";

  readonly _isBlockForkEvent?: boolean;

  constructor(blockHash: string, expiry?: number) {
    if (!isHexString(blockHash, 32)) {
      logger.throwArgumentError("invalid blockHash", "blockHash", blockHash);
    }

    super({
      _isForkEvent: true,
      _isBlockForkEvent: true,
      expiry: expiry || 0,
      blockHash: blockHash,
    });
  }
}

interface EventFilter {
  address?: string;
  topics?: Array<string | Array<string> | null>;
}
type EventType =
  | string
  | Array<string | Array<string>>
  | EventFilter
  | ForkEvent;

type Network = {
  name: string;
  chainId: number;
  ensAddress?: string;
  _defaultProvider?: (providers: any, options?: any) => any;
};
type BlockTag = string | number;
type TransactionRequest = {
  to?: string;
  from?: string;
  nonce?: BigNumberish;

  gasLimit?: BigNumberish;
  gasPrice?: BigNumberish;

  data?: BytesLike;
  value?: BigNumberish;
  chainId?: number;

  type?: number;
  accessList?: AccessListish;

  maxPriorityFeePerGas?: BigNumberish;
  maxFeePerGas?: BigNumberish;

  customData?: Record<string, any>;
  ccipReadEnabled?: boolean;
};

interface Log {
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;

  removed: boolean;

  address: string;
  data: string;

  topics: Array<string>;

  transactionHash: string;
  logIndex: number;
}
interface TransactionReceipt {
  to: string;
  from: string;
  contractAddress: string;
  transactionIndex: number;
  root?: string;
  gasUsed: BigNumber;
  logsBloom: string;
  blockHash: string;
  transactionHash: string;
  logs: Array<Log>;
  blockNumber: number;
  confirmations: number;
  cumulativeGasUsed: BigNumber;
  effectiveGasPrice: BigNumber;
  byzantium: boolean;
  type: number;
  status?: number;
}
interface TransactionReceipt {
  to: string;
  from: string;
  contractAddress: string;
  transactionIndex: number;
  root?: string;
  gasUsed: BigNumber;
  logsBloom: string;
  blockHash: string;
  transactionHash: string;
  logs: Array<Log>;
  blockNumber: number;
  confirmations: number;
  cumulativeGasUsed: BigNumber;
  effectiveGasPrice: BigNumber;
  byzantium: boolean;
  type: number;
  status?: number;
}

interface TransactionResponse extends Transaction {
  hash: string;

  // Only if a transaction has been mined
  blockNumber?: number;
  blockHash?: string;
  timestamp?: number;

  confirmations: number;

  // Not optional (as it is in Transaction)
  from: string;

  // The raw transaction
  raw?: string;

  // This function waits until the transaction has been mined
  wait: (confirmations?: number) => Promise<TransactionReceipt>;
}

export interface _Block {
  hash: string;
  parentHash: string;
  number: number;

  timestamp: number;
  nonce: string;
  difficulty: number;
  _difficulty: BigNumber;

  gasLimit: BigNumber;
  gasUsed: BigNumber;

  miner: string;
  extraData: string;

  baseFeePerGas?: null | BigNumber;
}
interface Block extends _Block {
  transactions: Array<string>;
}
interface BlockWithTransactions extends _Block {
  transactions: Array<TransactionResponse>;
}

export class MultiJsonRpcProvider extends ethers.providers.Provider {
  private _provider: ethers.providers.JsonRpcProvider;
  private nextProvider: NextItemFunc<ethers.providers.JsonRpcProvider>;
  private maxRetries: number;

  constructor(
    providers: ethers.providers.JsonRpcProvider[],
    maxRetries: number = 3,
  ) {
    if (providers.length === 0) {
      throw new Error("You must provide at least one provider");
    }

    super();

    this.nextProvider = itemCycler(providers);
    this._provider = this.nextProvider();
    this.maxRetries = maxRetries;
  }

  async getNetwork(): Promise<Network> {
    console.log(`getNetwork from: ${this._provider.connection.url}`);

    return this.resolveInAttempts(
      (provider: ethers.providers.JsonRpcProvider): Promise<Network> => {
        return provider.getNetwork();
      },
    );
  }

  async getBlockNumber(): Promise<number> {
    console.log(`getBlockNumber from: ${this._provider.connection.url}`);

    return this.resolveInAttempts(
      (provider: ethers.providers.JsonRpcProvider): Promise<number> => {
        return provider.getBlockNumber();
      },
    );
  }

  async getGasPrice(): Promise<BigNumber> {
    console.log(`getGasPrice from: ${this._provider.connection.url}`);

    return this.resolveInAttempts(
      (provider: ethers.providers.JsonRpcProvider): Promise<BigNumber> => {
        return provider.getGasPrice();
      },
    );
  }

  async getFeeData(): Promise<FeeData> {
    console.log(`getFeeData from: ${this._provider.connection.url}`);

    return this.resolveInAttempts(
      (provider: ethers.providers.JsonRpcProvider): Promise<FeeData> => {
        return provider.getFeeData();
      },
    );
  }

  async getBalance(
    addressOrName: string | Promise<string>,
    blockTag?: BlockTag | Promise<BlockTag>,
  ): Promise<BigNumber> {
    console.log(`getBalance from: ${this._provider.connection.url}`);

    return this.resolveInAttempts(
      (provider: ethers.providers.JsonRpcProvider): Promise<BigNumber> => {
        return provider.getBalance(addressOrName, blockTag);
      },
    );
  }

  async getTransactionCount(
    addressOrName: string | Promise<string>,
    blockTag?: BlockTag | Promise<BlockTag>,
  ): Promise<number> {
    return this.resolveInAttempts(
      (provider: ethers.providers.JsonRpcProvider): Promise<number> => {
        return provider.getTransactionCount(addressOrName, blockTag);
      },
    );
  }

  async getCode(
    addressOrName: string | Promise<string>,
    blockTag?: BlockTag | Promise<BlockTag>,
  ): Promise<string> {
    return this.resolveInAttempts(
      (provider: ethers.providers.JsonRpcProvider): Promise<string> => {
        return provider.getCode(addressOrName, blockTag);
      },
    );
  }

  async getStorageAt(
    addressOrName: string | Promise<string>,
    position: BigNumberish | Promise<BigNumberish>,
    blockTag?: BlockTag | Promise<BlockTag>,
  ): Promise<string> {
    return this.resolveInAttempts(
      (provider: ethers.providers.JsonRpcProvider): Promise<string> => {
        return provider.getStorageAt(addressOrName, position, blockTag);
      },
    );
  }

  async sendTransaction(
    signedTransaction: string | Promise<string>,
  ): Promise<TransactionResponse> {
    return this.resolveInAttempts(
      (
        provider: ethers.providers.JsonRpcProvider,
      ): Promise<TransactionResponse> => {
        return provider.sendTransaction(signedTransaction);
      },
    );
  }

  async call(
    transaction: Deferrable<TransactionRequest>,
    blockTag?: BlockTag | Promise<BlockTag>,
  ): Promise<string> {
    return this.resolveInAttempts(
      (provider: ethers.providers.JsonRpcProvider): Promise<string> => {
        return provider.call(transaction, blockTag);
      },
    );
  }

  async estimateGas(
    transaction: Deferrable<TransactionRequest>,
  ): Promise<BigNumber> {
    return this.resolveInAttempts(
      (provider: ethers.providers.JsonRpcProvider): Promise<BigNumber> => {
        return provider.estimateGas(transaction);
      },
    );
  }

  async getBlock(
    blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>,
  ): Promise<Block> {
    return this.resolveInAttempts(
      (provider: ethers.providers.JsonRpcProvider): Promise<Block> => {
        return provider.getBlock(blockHashOrBlockTag);
      },
    );
  }

  async getBlockWithTransactions(
    blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>,
  ): Promise<BlockWithTransactions> {
    return this.resolveInAttempts(
      (
        provider: ethers.providers.JsonRpcProvider,
      ): Promise<BlockWithTransactions> => {
        return provider.getBlockWithTransactions(blockHashOrBlockTag);
      },
    );
  }

  async getTransaction(transactionHash: string): Promise<TransactionResponse> {
    return this.resolveInAttempts(
      (
        provider: ethers.providers.JsonRpcProvider,
      ): Promise<TransactionResponse> => {
        return provider.getTransaction(transactionHash);
      },
    );
  }

  async getTransactionReceipt(
    transactionHash: string,
  ): Promise<TransactionReceipt> {
    return this.resolveInAttempts(
      (
        provider: ethers.providers.JsonRpcProvider,
      ): Promise<TransactionReceipt> => {
        return provider.getTransactionReceipt(transactionHash);
      },
    );
  }

  async getLogs(filter: Filter): Promise<Array<Log>> {
    return this.resolveInAttempts(
      (provider: ethers.providers.JsonRpcProvider): Promise<Array<Log>> => {
        return provider.getLogs(filter);
      },
    );
  }

  async resolveName(name: string | Promise<string>): Promise<null | string> {
    return this.resolveInAttempts(
      (provider: ethers.providers.JsonRpcProvider): Promise<null | string> => {
        return provider.resolveName(name);
      },
    );
  }

  async lookupAddress(
    address: string | Promise<string>,
  ): Promise<null | string> {
    return this.resolveInAttempts(
      (provider: ethers.providers.JsonRpcProvider): Promise<null | string> => {
        return provider.lookupAddress(address);
      },
    );
  }

  async waitForTransaction(
    transactionHash: string,
    confirmations?: number,
    timeout?: number,
  ): Promise<TransactionReceipt> {
    return this.resolveInAttempts(
      (
        provider: ethers.providers.JsonRpcProvider,
      ): Promise<TransactionReceipt> => {
        return provider.waitForTransaction(
          transactionHash,
          confirmations,
          timeout,
        );
      },
    );
  }

  on(
    eventName: EventType,
    listener: ethers.providers.Listener,
  ): ethers.providers.Provider {
    return this._provider.on(eventName, listener);
  }

  once(
    eventName: EventType,
    listener: ethers.providers.Listener,
  ): ethers.providers.Provider {
    return this._provider.once(eventName, listener);
  }

  emit(eventName: EventType, ...args: Array<any>): boolean {
    return this._provider.emit(eventName, ...args);
  }

  listenerCount(eventName?: EventType): number {
    return this._provider.listenerCount(eventName);
  }

  listeners(eventName?: EventType): Array<ethers.providers.Listener> {
    return this._provider.listeners(eventName);
  }

  off(eventName: EventType, listener?: ethers.providers.Listener): this {
    this._provider.off(eventName, listener);

    return this;
  }

  removeAllListeners(eventName?: EventType): this {
    this._provider.removeAllListeners(eventName);

    return this;
  }

  async resolveInAttempts<T>(
    operation: (provider: ethers.providers.JsonRpcProvider) => Promise<T>,
  ): Promise<T> {
    const that = this;

    return new Promise((resolve, reject) => {
      let attempts = 0;

      function attemptAction() {
        operation(that._provider)
          .then(resolve)
          .catch((error: any) => {
            attempts++;
            console.log(
              `Attempt ${attempts} failed with provider: ${that._provider.connection.url}: ${error}`,
            );
            if (attempts >= that.maxRetries) {
              reject(
                new Error(
                  `Operation failed after ${attempts} attempts with provider: ${that._provider.connection.url}: ${error}`,
                ),
              );
            }
            that._provider = that.nextProvider();
            console.log(
              `Retrying with provider: ${that._provider.connection.url}`,
            );

            setTimeout(attemptAction, 500);
          });
      }

      attemptAction();
    });
  }
}
