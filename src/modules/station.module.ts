import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { StationService } from '../services/station.service';
import { StationController } from '../controllers/station.controller';

// Importar entidades MySQL
import { Station } from '../models/mysql/station.entity';
import { RouteStation } from '../models/mysql/route-station.entity';
import { StationSchedule } from '../models/mysql/station-schedule.entity';
import { Route } from '../models/mysql/route.entity';

// Importar esquemas MongoDB
import { StationDetails, StationDetailsSchema } from '../models/mongodb/station-details.schema';

@Module({
  imports: [
    // Configuración TypeORM para entidades MySQL
    TypeOrmModule.forFeature([
      Station,
      RouteStation,
      StationSchedule,
      Route
    ]),
    
    // Configuración Mongoose para esquemas MongoDB
    MongooseModule.forFeature([
      { 
        name: StationDetails.name, 
        schema: StationDetailsSchema 
      }
    ]),
  ],
  controllers: [StationController],
  providers: [StationService],
  exports: [StationService], // Exportar para usar en otros módulos
})
export class StationModule {}