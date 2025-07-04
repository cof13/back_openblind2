// src/app.module.ts (Solución completa)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

// Importar las configuraciones
import { keys } from './config/keys';

// Importar todas las entidades MySQL
import { User } from './models/mysql/user.entity';
import { Role } from './models/mysql/role.entity';
import { Route } from './models/mysql/route.entity';
import { Station } from './models/mysql/station.entity';
import { PersonalizedMessage } from './models/mysql/personalized-message.entity';
import { VoiceGuide } from './models/mysql/voice-guide.entity';
import { TouristPoint } from './models/mysql/tourist-point.entity';
import { ServiceRating } from './models/mysql/service-rating.entity';
import { UserSession } from './models/mysql/user-session.entity';
import { UserPhone } from './models/mysql/user-phone.entity';
import { UserActivity } from './models/mysql/user-activity.entity';
import { UserContact } from './models/mysql/user-contact.entity';
import { UserUIConfiguration } from './models/mysql/user-ui-configuration.entity';
import { RouteStation } from './models/mysql/route-station.entity';
import { RouteMessage } from './models/mysql/route-message.entity';
import { StationSchedule } from './models/mysql/station-schedule.entity';
import { SystemNotification } from './models/mysql/system-notification.entity';
import { ActionAudit } from './models/mysql/action-audit.entity';
import { EntityStatus } from './models/mysql/entity-status.entity';
import { MapInteraction } from './models/mysql/map-interaction.entity';
import { PaginationLog } from './models/mysql/pagination-log.entity';
import { MessageRoute } from './models/mysql/message-route.entity';

// Importar módulos
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // ConfigModule para cargar variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),

    // Configuración de TypeORM (MySQL)
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: keys.MYSQL_HOST,
      port: keys.MYSQL_PORT,
      username: keys.MYSQL_USERNAME,
      password: keys.MYSQL_PASSWORD,
      database: keys.MYSQL_DATABASE,
      entities: [
        User,
        Role,
        Route,
        Station,
        PersonalizedMessage,
        VoiceGuide,
        TouristPoint,
        ServiceRating,
        UserSession,
        UserPhone,
        UserActivity,
        UserContact,
        UserUIConfiguration,
        RouteStation,
        RouteMessage,
        MessageRoute,
        StationSchedule,
        SystemNotification,
        ActionAudit,
        EntityStatus,
        MapInteraction,
        PaginationLog,
      ],
      synchronize: keys.NODE_ENV !== 'production',
      logging: keys.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      autoLoadEntities: true,
    }),

    // Configuración de MongoDB con manejo de errores
    MongooseModule.forRootAsync({
      useFactory: () => {
        console.log('🔄 Configurando conexión a MongoDB...');
        console.log('📍 URI:', keys.MONGO_URI);
        
        return {
          uri: keys.MONGO_URI,
          // Opciones de conexión robustas
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          connectTimeoutMS: 10000,
          bufferCommands: false,
          maxPoolSize: 10,
          minPoolSize: 1,
          retryAttempts: 3,
          retryDelay: 1000,
          
        };
      },
    }),

    // Módulos de funcionalidad
    UserModule,
    RoleModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}