import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { VoiceGuideService } from './voice-guide.service';
import { VoiceGuideController } from './voice-guide.controller';
import { VoiceGuide } from '../../models/mysql/voice-guide.entity';
import { Route } from '../../models/mysql/route.entity';
import { PersonalizedMessage } from '../../models/mysql/personalized-message.entity';
import { VoiceGuide as VoiceGuideSchema, VoiceGuideSchema as VoiceGuideSchemaFile } from '../../models/mongodb/voice-guide.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([VoiceGuide, Route, PersonalizedMessage]),
    MongooseModule.forFeature([
      { name: VoiceGuideSchema.name, schema: VoiceGuideSchemaFile }
    ]),
  ],
  controllers: [VoiceGuideController],
  providers: [VoiceGuideService],
  exports: [VoiceGuideService],
})
export class VoiceGuideModule {}