import { map } from 'bluebird';
import winston from 'winston';

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