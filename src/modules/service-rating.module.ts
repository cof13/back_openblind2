// src/modules/service-rating/service-rating.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceRatingService } from '../services/service-rating.service';
import { ServiceRatingController } from '../controllers/service-rating.controller';

// Importar entidades MySQL
import { ServiceRating } from '../models/mysql/service-rating.entity';
import { User } from '../models/mysql/user.entity';

// Importar esquemas MongoDB
import { ServiceRating as MongoServiceRating, ServiceRatingSchema } from '../models/mongodb/service-rating.schema';

@Module({
  imports: [
    // Configuración TypeORM para entidades MySQL
    TypeOrmModule.forFeature([
      ServiceRating,
      User
    ]),
    
    // Configuración Mongoose para esquemas MongoDB
    MongooseModule.forFeature([
      { 
        name: MongoServiceRating.name, 
        schema: ServiceRatingSchema 
      }
    ]),
  ],
  controllers: [ServiceRatingController],
  providers: [ServiceRatingService],
  exports: [ServiceRatingService], // Exportar para usar en otros módulos
})
export class ServiceRatingModule {}