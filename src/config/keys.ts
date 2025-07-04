// src/config/keys.ts

export const keys = {
  // Database SQL (MySQL)
  MYSQL_HOST:  'localhost',
  MYSQL_PORT: 3306,
  MYSQL_USERNAME: 'root',
  MYSQL_PASSWORD:'',
  MYSQL_DATABASE: 'openblind',

  // Database MongoDB
  MONGO_URI:'mongodb://localhost:27017/openblind',

  // JWT Secret (Example)
  JWT_SECRET: 'supersecretkey',

  // Other application specific keys
  APP_PORT:  '3000',
  NODE_ENV:  'development',
};
