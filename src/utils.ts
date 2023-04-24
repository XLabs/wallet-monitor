import { map } from 'bluebird';

export function mapConcurrent<T>(iterable: T[], mapper: (x: T, i: number, s: number) => any, concurrency = 1): Promise<any[]> {
  return map(iterable, mapper, { concurrency });
}

export declare interface Logger {
  debug: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

export function getSilentLogger () {
  return {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  };
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function omit(obj: any, key: string) {
  const { [key]: _, ...rest } = obj;
  return rest;
}