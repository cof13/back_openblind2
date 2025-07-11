//src/app.module.ts`** (usando configuraciones centralizadas):
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { keys } from './config/keys';
import { LoggerModule } from './config/logger.module';
import { typeOrmConfig } from './config/database.mysql';
import { mongooseConfig } from './config/database.mongo';
// Importar módulos de funcionalidad
import { UserModule } from './modules/user.module';
import { RoleModule } from './modules/role.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { VoiceGuideModule } from './modules/voice-guide.module';
import { RouteModule } from './modules/rute.module'; // Asegúrate que el nombre del archivo sea correcto (rute.module o route.module)
import { StationModule } from './modules/station.module';
import { TransportModule } from './modules/transport.module';
import { PersonalizedMessageModule } from './modules/personalized-message.module';
import { TouristPointModule } from './modules/tourist-point.module';
import { ServiceRatingModule } from './modules/service-rating.module';
import { SystemNotificationModule } from './modules/system-notification.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),
    // Configuración de TypeORM usando configuración centralizada
    TypeOrmModule.forRoot(typeOrmConfig),
    // Configuración de MongoDB usando configuración centralizada
    MongooseModule.forRootAsync({
      useFactory: () => mongooseConfig
    }),
    // Módulos de funcionalidad
    LoggerModule,
    UserModule,
    RoleModule,
    AuthModule,
    VoiceGuideModule,
    RouteModule, // Asegúrate que el nombre de la variable coincida
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