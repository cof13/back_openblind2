// src/config/mysql.connection.ts
import { createConnection, getConnection, Connection } from 'typeorm';
import { keys } from './keys';
import { AppLogger } from './logger';

let mysqlConnection: Connection;

export async function connectMySQL(): Promise<Connection> {
  const logger = new AppLogger();
  
  try {
    if (mysqlConnection && mysqlConnection.isConnected) {
      return mysqlConnection;
    }

    mysqlConnection = await createConnection({
      type: 'mysql',
      host: keys.MYSQL_HOST,
      port: keys.MYSQL_PORT,
      username: keys.MYSQL_USERNAME,
      password: keys.MYSQL_PASSWORD,
      database: keys.MYSQL_DATABASE,
      entities: [__dirname + '/../models/mysql/**/*.entity{.ts,.js}'],
      synchronize: keys.NODE_ENV !== 'production',
      logging: keys.NODE_ENV === 'development' ? true : ['error', 'warn'],
      migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
      migrationsRun: false,
      ssl: keys.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    logger.log(`✅ MySQL conectado en: ${keys.MYSQL_HOST}:${keys.MYSQL_PORT}/${keys.MYSQL_DATABASE}`);
    return mysqlConnection;
  } catch (error) {
    logger.error('❌ Error de conexión a MySQL:', error.stack || error);
    
    logger.warn('💡 Posibles soluciones:');
    logger.warn('   1. Verificar que el servidor MySQL esté en ejecución');
    logger.warn('   2. Validar las credenciales de acceso');
    logger.warn('   3. Confirmar que la base de datos exista');
    logger.warn('   4. Chequear permisos de usuario');
    logger.warn('   5. Verificar configuración de firewall/red');
    
    process.exit(1);
  }
}

export async function closeMySQLConnection(): Promise<void> {
  const logger = new AppLogger();
  
  try {
    if (mysqlConnection && mysqlConnection.isConnected) {
      await mysqlConnection.close();
      logger.log('📴 Conexión MySQL cerrada');
    } else {
      logger.log('ℹ️ No hay conexión MySQL activa para cerrar');
    }
  } catch (error) {
    logger.error('❌ Error al cerrar conexión MySQL:', error.stack || error);
  }
}

// Función para obtener la conexión activa
export function getMySQLConnection(): Connection {
  if (!mysqlConnection || !mysqlConnection.isConnected) {
    throw new Error('MySQL connection not established');
  }
  return mysqlConnection;
}