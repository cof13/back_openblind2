// src/modules/personalized-message/personalized-message.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { PersonalizedMessageService } from '../services/personalized-message.service';
import { PersonalizedMessageController } from '../controllers/personalized-message.controller';

// Importar entidades MySQL
import { PersonalizedMessage } from '../models/mysql/personalized-message.entity';
import { Route } from '../models/mysql/route.entity';
import { User } from '../models/mysql/user.entity';
import { VoiceGuide } from '../models/mysql/voice-guide.entity';
import { RouteMessage } from '../models/mysql/route-message.entity';

// Importar esquemas MongoDB
import { MessageContent, MessageContentSchema } from '../models/mongodb/message-content.schema';

@Module({
  imports: [
    // Configuración TypeORM para entidades MySQL
    TypeOrmModule.forFeature([
      PersonalizedMessage,
      Route,
      User,
      VoiceGuide,
      RouteMessage
    ]),
    
    // Configuración Mongoose para esquemas MongoDB
    MongooseModule.forFeature([
      { 
        name: MessageContent.name, 
        schema: MessageContentSchema 
      }
    ]),
  ],
  controllers: [PersonalizedMessageController],
  providers: [PersonalizedMessageService],
  exports: [PersonalizedMessageService], // Exportar para usar en otros módulos
})
export class PersonalizedMessageModule {}