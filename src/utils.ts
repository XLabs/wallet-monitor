import { map } from 'bluebird';

export function mapConcurrent<T>(iterable: T[], mapper: (x:T, i: number, s: number) => any, concurrency = 1) {
    return map(iterable, mapper, { concurrency });
}