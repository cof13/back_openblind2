import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { keys } from './keys';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: keys.MYSQL_HOST,
  port: keys.MYSQL_PORT,
  username: keys.MYSQL_USERNAME,
  password: keys.MYSQL_PASSWORD,
  database: keys.MYSQL_DATABASE,
  entities: [__dirname + '/../models/mysql/**/*.entity{.ts,.js}'], // 👈 Automático
  synchronize: true, // ⚠️ Solo para desarrollo
  logging: true,
};
