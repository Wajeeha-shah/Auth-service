import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'auth-service',
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.json(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
          const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level}]: ${stack ?? message}${extra}`;
        })
      ),
    }),
new winston.transports.File({
  level: 'error',
  dirname: 'logs',
  filename: 'error.log',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  silent: process.env.ENV === 'production'
})

  ],
  
});


export default logger;
