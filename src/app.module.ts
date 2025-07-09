import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { keys } from './config/keys';
import { LoggerModule } from './config/logger.module';

// Elimina las importaciones manuales de las entidades MySQL
// (TypeORM las cargará automáticamente)

// Importar módulos de funcionalidad
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { VoiceGuideModule } from './modules/voice-guide/voice-guide.module';
import { RouteModule } from './modules/rute/rute.module';
import { StationModule } from './modules/station/station.module';
import { TransportModule } from './modules/transport/transport.module';
import { PersonalizedMessageModule } from './modules/personalized-message/personalized-message.module';
import { TouristPointModule } from './modules/tourist-point/tourist-point.module';
import { ServiceRatingModule } from './modules/service-rating/service-rating.module';
import { SystemNotificationModule } from './modules/system-notification/system-notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),

    // Configuración de TypeORM con carga automática de entidades
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: keys.MYSQL_HOST,
      port: keys.MYSQL_PORT,
      username: keys.MYSQL_USERNAME,
      password: keys.MYSQL_PASSWORD,
      database: keys.MYSQL_DATABASE,
      // Cambia `entities` por `autoLoadEntities` + `entities` para búsqueda automática:
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Busca en todos los archivos `.entity.ts` o `.entity.js`
      autoLoadEntities: true, // Opcional (puede combinarse con `entities`)
      synchronize: keys.NODE_ENV !== 'production',
      logging: keys.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    }),

    // Configuración de MongoDB
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: keys.MONGO_URI,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
      }),
    }),

    // Módulos de funcionalidad
    LoggerModule,
    UserModule,
    RoleModule,
    AuthModule,
    VoiceGuideModule,
    RouteModule,
    StationModule,
    TransportModule,
    PersonalizedMessageModule,
    TouristPointModule,
    ServiceRatingModule,
    SystemNotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
