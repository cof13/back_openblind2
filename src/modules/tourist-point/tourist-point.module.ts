
// src/modules/tourist-point/tourist-point.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { TouristPointService } from './tourist-point.service';
import { TouristPointController } from './tourist-point.controller';

// Importar entidades MySQL
import { TouristPoint } from '../../models/mysql/tourist-point.entity';
import { User } from '../../models/mysql/user.entity';

// Importar esquemas MongoDB
import { TouristPoint as MongoTouristPoint, TouristPointSchema } from '../../models/mongodb/tourist-point.schema';

@Module({
  imports: [
    // Configuración TypeORM para entidades MySQL
    TypeOrmModule.forFeature([
      TouristPoint,
      User
    ]),
    
    // Configuración Mongoose para esquemas MongoDB
    MongooseModule.forFeature([
      { 
        name: MongoTouristPoint.name, 
        schema: TouristPointSchema 
      }
    ]),
  ],
  controllers: [TouristPointController],
  providers: [TouristPointService],
  exports: [TouristPointService], // Exportar para usar en otros módulos
})
export class TouristPointModule {}