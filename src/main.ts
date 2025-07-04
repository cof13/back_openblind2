// src/main.ts (Mejorado)
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { keys } from './config/keys';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

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
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: keys.NODE_ENV === 'production',
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
    
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
    
    // Información adicional para depuración
    if (error.message.includes('MongoDB')) {
      console.error('💡 Posibles soluciones:');
      console.error('   1. Verificar que MongoDB esté ejecutándose');
      console.error('   2. Verificar la URL de conexión en MONGO_URI');
      console.error('   3. Verificar permisos de acceso a la base de datos');
    }
    
    process.exit(1);
  }
}

bootstrap();