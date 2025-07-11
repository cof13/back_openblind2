//src/config/database.mysql.ts`** (asegurando usar keys):

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { keys } from './keys';
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: keys.MYSQL_HOST,
  port: keys.MYSQL_PORT,
  username: keys.MYSQL_USERNAME,
  password: keys.MYSQL_PASSWORD,
  database: keys.MYSQL_DATABASE,
  entities: [__dirname + '/../models/mysql/**/*.entity{.ts,.js}'], // Ajusta la ruta si es necesario
  synchronize: keys.NODE_ENV !== 'production', // Solo en desarrollo
  logging: keys.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  dropSchema: false,
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
  migrationsRun: false,
  ssl: keys.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};