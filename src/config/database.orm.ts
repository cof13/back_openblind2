import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { keys } from './keys';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: keys.MYSQL_HOST,
  port: keys.MYSQL_PORT,
  username: keys.MYSQL_USERNAME,
  password: keys.MYSQL_PASSWORD,
  database: keys.MYSQL_DATABASE,
  entities: [__dirname + '/../models/mysql/**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production', // Solo en desarrollo
  logging: process.env.NODE_ENV === 'development' ? true : ['error', 'warn'],
  dropSchema: false,
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
  migrationsRun: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};