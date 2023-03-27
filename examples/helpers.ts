import winston from 'winston';

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
  winston.format.errors({ stack: true }),
);

export function getLogger(logLevel: string) {
  const fileTransport = new winston.transports.File({
    filename: `logs/wallet-monitor-${(new Date()).toISOString()}.log`,
    level: logLevel,
  });

  return winston.createLogger({
    transports: [fileTransport],
    format: jsonFormat,
  });
}