// src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config'; // Importar ConfigModule para cargar .env

// Importar las configuraciones
import { typeOrmConfig } from './config/database.orm';
import { mongooseConfig } from './config/database.mongo';
import { keys } from './config/keys'; // Aunque ConfigModule lo maneja, lo mantenemos para referencia

// Importar los esquemas de MongoDB para MongooseModule.forFeature
import { UserProfile, UserProfileSchema } from './models/mongodb/user-profile.schema';
import { RouteDetails, RouteDetailsSchema } from './models/mongodb/route-details.schema';
import { MessageContent, MessageContentSchema } from './models/mongodb/message-content.schema';
import { TouristPoint as MongoTouristPoint, TouristPointSchema as MongoTouristPointSchema } from './models/mongodb/tourist-point.schema'; // Renombrar para evitar conflicto
import { VoiceGuide as MongoVoiceGuide, VoiceGuideSchema as MongoVoiceGuideSchema } from './models/mongodb/voice-guide.schema'; // Renombrar
import { StationDetails, StationDetailsSchema } from './models/mongodb/station-details.schema';
import { ServiceRating as MongoServiceRating, ServiceRatingSchema as MongoServiceRatingSchema } from './models/mongodb/service-rating.schema'; // Renombrar
import { LocationHistory, LocationHistorySchema } from './models/mongodb/location-history.schema';
import { FormValidation, FormValidationSchema } from './models/mongodb/form-validation.schema';
import { SearchHistory, SearchHistorySchema } from './models/mongodb/search-history.schema';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';


@Module({
  imports: [
    // ConfigModule para cargar variables de entorno (opcional pero recomendado)
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables de entorno estén disponibles globalmente
      envFilePath: '.env', // Especifica la ruta de tu archivo .env
    }),

    // Configuración de TypeORM (MySQL)
    TypeOrmModule.forRoot(typeOrmConfig),

    // Configuración de Mongoose (MongoDB)
    MongooseModule.forRoot( keys.MONGO_URI),
    // Registrar los esquemas de MongoDB con MongooseModule.forFeature
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
    UserModule,
    RoleModule,

    // ... otros módulos de tu aplicación
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
