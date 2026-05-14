/**
 * App-wide configuration
 */
require('dotenv').config();

module.exports = {
  app: {
    name: process.env.APP_NAME || 'VaultEXP',
    version: process.env.APP_VERSION || '1.0.0',
    port: Number(process.env.PORT) || 5000,
    env: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
  },

  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/vaultexp',
    name: process.env.MONGODB_DB_NAME || 'vaultexp',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_this',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  },

  email: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'noreply@vaultexp.com',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
  },
};
