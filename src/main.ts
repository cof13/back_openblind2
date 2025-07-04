import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { keys } from './config/keys';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: keys.CORS_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configurar prefijo global para API
  app.setGlobalPrefix(keys.API_PREFIX);

  // Configurar pipes globales
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Eliminar propiedades no definidas en el DTO
    forbidNonWhitelisted: true, // Lanzar error si hay propiedades extra
    transform: true, // Transformar tipos automáticamente
    disableErrorMessages: keys.NODE_ENV === 'production', // Ocultar mensajes en producción
  }));

  // Configurar interceptor global para serialización
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector))
  );

  await app.listen(keys.APP_PORT);
  
  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${keys.APP_PORT}/${keys.API_PREFIX}`);
  console.log(`📊 Base de datos MySQL: ${keys.MYSQL_HOST}:${keys.MYSQL_PORT}/${keys.MYSQL_DATABASE}`);
  console.log(`🍃 Base de datos MongoDB: ${keys.MONGO_URI}`);
  console.log(`🌍 Entorno: ${keys.NODE_ENV}`);
}

bootstrap().catch((error) => {
  console.error('Error al iniciar la aplicación:', error);
  process.exit(1);
});