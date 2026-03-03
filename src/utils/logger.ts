import winston from 'winston';

const { combine, timestamp, printf } = winston.format;

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message} `;  
  if (Object.keys(metadata).length > 0) {
    msg += JSON.stringify(metadata);
  }
  return msg;
});

const accessFormat = printf(({ level, message, timestamp }) => {
  // Expected message is a string already formatted for simplicity or we can use metadata
  return `${timestamp} - [${level}] : ${message}`;
});

export const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'DD.MM.YYYY HH:mm:ss.SSS' }),
    myFormat
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/app.error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/app.log' }),
  ],
});

export const accessLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'DD.MM.YYYY HH:mm:ss.SSS' }),
    printf((info) => {
      const { level, message, timestamp } = info as { level: string, message: string, timestamp: string };
      // The message will be the template with placeholders
      return message.replace('<timestamp>', timestamp).replace('<level>', level);
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/app.access.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
