// src/app.module.ts (Actualizado)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

// Importar las configuraciones
import { typeOrmConfig } from './config/database.orm';
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

// Importar los esquemas de MongoDB
import { UserProfile, UserProfileSchema } from './models/mongodb/user-profile.schema';
import { RouteDetails, RouteDetailsSchema } from './models/mongodb/route-details.schema';
import { MessageContent, MessageContentSchema } from './models/mongodb/message-content.schema';
import { TouristPoint as MongoTouristPoint, TouristPointSchema as MongoTouristPointSchema } from './models/mongodb/tourist-point.schema';
import { VoiceGuide as MongoVoiceGuide, VoiceGuideSchema as MongoVoiceGuideSchema } from './models/mongodb/voice-guide.schema';
import { StationDetails, StationDetailsSchema } from './models/mongodb/station-details.schema';
import { ServiceRating as MongoServiceRating, ServiceRatingSchema as MongoServiceRatingSchema } from './models/mongodb/service-rating.schema';
import { LocationHistory, LocationHistorySchema } from './models/mongodb/location-history.schema';
import { FormValidation, FormValidationSchema } from './models/mongodb/form-validation.schema';
import { SearchHistory, SearchHistorySchema } from './models/mongodb/search-history.schema';

// Importar módulos
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // ConfigModule para cargar variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de TypeORM (MySQL) con todas las entidades
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: keys.MYSQL_HOST,
      port: keys.MYSQL_PORT,
      username: keys.MYSQL_USERNAME,
      password: keys.MYSQL_PASSWORD,
      database: keys.MYSQL_DATABASE,
      entities: [
        // Entidades principales
        User,
        Role,
        Route,
        Station,
        PersonalizedMessage,
        VoiceGuide,
        TouristPoint,
        ServiceRating,
        
        // Entidades de usuario
        UserSession,
        UserPhone,
        UserActivity,
        UserContact,
        UserUIConfiguration,
        
        // Entidades de relaciones
        RouteStation,
        RouteMessage,
        MessageRoute,
        StationSchedule,
        
        // Entidades de sistema
        SystemNotification,
        ActionAudit,
        EntityStatus,
        MapInteraction,
        PaginationLog,
      ],
      synchronize: true, // ⚠️ Solo para desarrollo
      logging: ['error', 'warn'], // Reducir logging en producción
      dropSchema: false, // No borrar esquema automáticamente
      migrations: [],
      migrationsRun: false,
    }),

    // Configuración de Mongoose (MongoDB)
    MongooseModule.forRoot(keys.MONGO_URI, {
      connectionName: 'default',
      retryAttempts: 5,
      retryDelay: 1000,
    }),

    // Registrar los esquemas de MongoDB
    MongooseModule.forFeature([
      { name: UserProfile.name, schema: UserProfileSchema },
      { name: RouteDetails.name, schema: RouteDetailsSchema },
      { name: MessageContent.name, schema: MessageContentSchema },
      { name: MongoTouristPoint.name, schema: MongoTouristPointSchema },
      { name: MongoVoiceGuide.name, schema: MongoVoiceGuideSchema },
      { name: StationDetails.name, schema: StationDetailsSchema },
      { name: MongoServiceRating.name, schema: MongoServiceRatingSchema },
      { name: LocationHistory.name, schema: LocationHistorySchema },
      { name: FormValidation.name, schema: FormValidationSchema },
      { name: SearchHistory.name, schema: SearchHistorySchema },
    ]),

    // Módulos de funcionalidad
    UserModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

