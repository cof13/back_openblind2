// src/main.ts
import { NestFactory,   Reflector } from '@nestjs/core';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  Logger,

} from '@nestjs/common';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppModule } from './app.module';
import { keys } from './config/keys';
import { AppLogger } from './config/logger';
import * as mongoose from 'mongoose';

async function bootstrap() {
  

  const logger = new AppLogger();

  const app = await NestFactory.create(AppModule, {
    logger
  });

  app.useLogger(logger); // Establecer el logger global de Nest

  try {
    // Configurar CORS
    app.enableCors({
      origin: keys.CORS_ORIGIN,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    // Prefijo global de rutas
    app.setGlobalPrefix(keys.API_PREFIX);

    // Pipes globales para validaciones
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: keys.NODE_ENV === 'production',
      }),
    );

    // Interceptores globales (para serialización)
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    // Escuchar errores de conexión de MongoDB
    mongoose.connection.on('error', (error) => {
      logger.error('❌ Error de conexión a MongoDB', error.stack || error);
    });

    // Capturar excepciones no manejadas (fuera del contexto de Nest)
    process.on('uncaughtException', (err: Error) => {
  logger.error('❌ Excepción no capturada', err.stack || err.message);
});

process.on('unhandledRejection', (reason: any) => {
  const message = reason instanceof Error
    ? reason.stack ?? reason.message
    : JSON.stringify(reason);

  logger.error('❌ Promesa no manejada', message);
});



    await app.listen(keys.APP_PORT);

    logger.log(`🚀 Aplicación ejecutándose en: http://localhost:${keys.APP_PORT}/${keys.API_PREFIX}`);
    logger.log(`📊 Base de datos MySQL: ${keys.MYSQL_HOST}:${keys.MYSQL_PORT}/${keys.MYSQL_DATABASE}`);
    logger.log(`🍃 Base de datos MongoDB: ${keys.MONGO_URI}`);
    logger.log(`🌍 Entorno: ${keys.NODE_ENV}`);
  } catch (error) {
    logger.error('❌ Error al iniciar la aplicación:', error.stack || error);

    if (error.message?.includes('MongoDB')) {
      logger.warn('💡 Posibles soluciones para MongoDB:');
      logger.warn('   1. Verificar que MongoDB esté ejecutándose');
      logger.warn('   2. Verificar la URL de conexión en MONGO_URI');
      logger.warn('   3. Verificar permisos de acceso a la base de datos');
    }

    process.exit(1);
  }
}

bootstrap();
