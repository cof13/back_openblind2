import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { RouteService } from './rute.service';
import { RouteController } from './rute.controller';

// Importar entidades MySQL
import { Route } from '../../models/mysql/route.entity';
import { User } from '../../models/mysql/user.entity';
import { PersonalizedMessage } from '../../models/mysql/personalized-message.entity';
import { RouteStation } from '../../models/mysql/route-station.entity';
import { RouteMessage } from '../../models/mysql/route-message.entity';
import { Station } from '../../models/mysql/station.entity';

// Importar esquemas MongoDB
import { RouteDetails, RouteDetailsSchema } from '../../models/mongodb/route-details.schema';

@Module({
  imports: [
    // Configuración TypeORM para entidades MySQL
    TypeOrmModule.forFeature([
      Route,
      User,
      PersonalizedMessage,
      RouteStation,
      RouteMessage,
      Station
    ]),
    
    // Configuración Mongoose para esquemas MongoDB
    MongooseModule.forFeature([
      { 
        name: RouteDetails.name, 
        schema: RouteDetailsSchema 
      }
    ]),
  ],
  controllers: [RouteController],
  providers: [RouteService],
  exports: [RouteService], // Exportar para usar en otros módulos
})
export class RouteModule {}