import process from 'node:process';
import winston from 'winston';

export const logger = winston.createLogger({
  exitOnError: false,
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  level: process.env['LOG_LEVEL'] || 'info',
  silent: process.env['NODE_ENV'] === 'test',
  transports: [new winston.transports.Console()],
});
