import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: isDevelopment  ? {
    target: 'pino-pretty',
    options: { colorize: true,
      translateTime: 'SYS:standard',
    },
  } : undefined,
  base: {
    service: 'track-route-app-backend',
    version: process.env.npm_package_version ?? '1.0.0',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['password', 'token', 'secret', 'authorization', 'cookie'],
    censor: '[REDACTED]',
  },
}); 

export type Logger = typeof logger;