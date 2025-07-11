// src/config/keys.ts (Sin uso de process.env)

export const keys = {
  // Database SQL (MySQL)
  MYSQL_HOST: 'localhost',
  MYSQL_PORT: 3306,
  MYSQL_USERNAME: 'root',
  MYSQL_PASSWORD: '',
  MYSQL_DATABASE: 'openblind',

  // Database MongoDB
  MONGO_URI: 'mongodb://localhost:27017/openblind',

  // JWT Settings
  JWT_SECRET: 'supersecretkey',
  JWT_EXPIRES_IN: '24h',

  // Application Settings
  APP_PORT: 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // API Settings
  API_PREFIX: 'api/v1',

  // File Upload Settings
  UPLOAD_PATH: './uploads',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB

  // Security Settings
  BCRYPT_SALT_ROUNDS: 12,

  // CORS Settings
  CORS_ORIGIN: '*',
};
