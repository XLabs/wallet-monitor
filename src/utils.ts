import { map } from 'bluebird';
import winston from 'winston';
import { inspect } from "util";
import {
  WalletManager, WalletManagerFullConfig, WalletManagerFullConfigSchema
} from "./wallet-manager";
import {ClientWalletManager} from "./grpc/client";
import {IClientWalletManager, ILibraryWalletManager} from "./i-wallet-manager";

export function mapConcurrent<T>(iterable: T[], mapper: (x: T, i: number, s: number) => any, concurrency = 1): Promise<any[]> {
  return map(iterable, mapper, { concurrency });
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function omit(obj: any, key: string) {
  const { [key]: _, ...rest } = obj;
  return rest;
}

export function createLogger(logger?: winston.Logger, logLevel?: string, meta?: any) {
  if (logger) return logger;

  const silent = !logLevel || logLevel === 'silent';

  const transport = silent
    ? new winston.transports.Console({ silent })
    : new winston.transports.Console({
      format: winston.format.combine(
        winston.format.label({ label: 'WalletManager' }),
        winston.format.colorize(),
        winston.format.splat(),
        winston.format.simple(),
        winston.format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss.SSS",
        }),
        winston.format.errors({ stack: true })
      )
    });

  const _logger = winston.createLogger({
    level: logLevel || 'error',
    transports: [transport],
  });

  return _logger;
}

// This function will return the same object with the minimal set of methods required to work for the
//  requested context.
export function buildWalletManager(rawWMFullConfig: WalletManagerFullConfig): IClientWalletManager | ILibraryWalletManager {
  const { config, options, grpc } = WalletManagerFullConfigSchema.parse(rawWMFullConfig)

  if (grpc) {
    return new ClientWalletManager(grpc.connectAddress, grpc.connectPort, config, options) as IClientWalletManager
  } else {
    return new WalletManager(config, options) as ILibraryWalletManager
  }
}

export type Accessor<T> = (obj: T) => number;

export function findMedian<T>(arr: T[], accessor: Accessor<T>): number | undefined {
    const sortedArr = arr.slice().sort((a, b) => accessor(a) - accessor(b));
    const len = sortedArr.length;
    if (len === 0) {
        return undefined;
    }
    const mid = Math.floor(len / 2);
    return len % 2 === 0 ? (accessor(sortedArr[mid - 1]) + accessor(sortedArr[mid])) / 2 : accessor(sortedArr[mid]);
}

export function printError(error: unknown): string {
  if (error instanceof Error) {
    return `${error?.stack || error.message}`;
  }

  // Prints nested properties until a depth of 2 by default.
  return inspect(error);
}

interface TTL<T> {
  value: T;
  timerId: NodeJS.Timeout;
}

export class TimeLimitedCache<K, V> {
  private readonly cache: Map<K, TTL<V>>
  constructor() {
      this.cache = new Map<K, TTL<V>>();
  }

  delete (key: K) {
      this.cache.delete(key);
  }

  set(key: K, value: V, duration: number): boolean {
      const doesKeyExists = this.cache.has(key);
      if (doesKeyExists) {
          clearTimeout(this.cache.get(key)?.timerId);
      }
      const timerId = setTimeout(() => this.delete(key), duration)
      this.cache.set(key, {value, timerId})
      return !!doesKeyExists
  }

  get(key: K): V | undefined {
      return this.cache.get(key)?.value;
  }
}