/**
 * Logger utility (production-ready console logger)
 * Replace with Winston or Pino for structured logging in production
 */
const isDev = process.env.NODE_ENV !== 'production';

const logger = {
  info:  (...args) => console.log('[INFO]', ...args),
  warn:  (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  debug: (...args) => { if (isDev) console.debug('[DEBUG]', ...args); },
};

module.exports = logger;
