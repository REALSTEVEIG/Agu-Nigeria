const winston = require('winston');

require('dotenv').config()

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    // Write to a file in production
    // process.env.NODE_ENV === 'production' ?
      new winston.transports.File({ filename: './logs/logs.log' }),
      // Use the console in development :
      new winston.transports.Console()
  ]
});

module.exports = logger