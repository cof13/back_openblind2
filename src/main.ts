//src/main.ts`** (sin conexiones manuales):

import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppModule } from './app.module';
import { keys } from './config/keys';
import { AppLogger } from './config/logger';
async function bootstrap() {
  const logger = new AppLogger();
  let app;
  try {
    // 1. Crear la aplicación
    app = await NestFactory.create(AppModule, {
      logger
    });
    // 2. Configuración básica de la app
    app.useLogger(logger);
    app.enableCors({
      origin: keys.CORS_ORIGIN,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
    app.setGlobalPrefix(keys.API_PREFIX);
    // 3. Configuración de pipes e interceptores
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: keys.NODE_ENV === 'production',
      }),
    );
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    
    // 4. Manejo global de excepciones
    app.useGlobalFilters(new AllExceptionsFilter(logger));
    // 5. Eventos globales de proceso
    process.on('uncaughtException', (err: Error) => {
      logger.error('❌ Excepción no capturada', err.stack || err.message);
    });
    process.on('unhandledRejection', (reason: any) => {
      const message = reason instanceof Error
        ? reason.stack ?? reason.message
        : JSON.stringify(reason);
      logger.error('❌ Promesa no manejada', message);
    });
    // 6. Iniciar servidor
    await app.listen(keys.APP_PORT);
    // 7. Logs de inicio exitoso
    logger.log(`🚀 Aplicación ejecutándose en: http://localhost:${keys.APP_PORT}/${keys.API_PREFIX}`);
    logger.log(`📊 Base de datos MySQL: ${keys.MYSQL_HOST}:${keys.MYSQL_PORT}/${keys.MYSQL_DATABASE}`);
    logger.log(`🍃 Base de datos MongoDB: ${keys.MONGO_URI}`);
    logger.log(`🌍 Entorno: ${keys.NODE_ENV}`);
  } catch (error) {
    logger.error('❌ Error crítico durante el inicio:', error.stack || error);
    
    // Mensajes de diagnóstico para MySQL
    if (error.message?.includes('MySQL') || error.message?.includes('ECONNREFUSED')) {
      logger.warn('💡 Posibles soluciones para MySQL:');
      logger.warn('   1. Verificar que MySQL esté ejecutándose');
      logger.warn('   2. Validar host/puerto en la configuración');
      logger.warn('   3. Confirmar credenciales de acceso');
      logger.warn('   4. Chequear permisos de usuario');
    }
    
    // Mensajes de diagnóstico para MongoDB
    if (error.message?.includes('MongoDB') || error.message?.includes('failed to connect')) {
      logger.warn('💡 Posibles soluciones para MongoDB:');
      logger.warn('   1. Verificar que MongoDB esté ejecutándose');
      logger.warn('   2. Verificar la URL de conexión en MONGO_URI');
      logger.warn('   3. Verificar permisos de acceso a la base de datos');
    }
    process.exit(1);
  }
}
bootstrap();