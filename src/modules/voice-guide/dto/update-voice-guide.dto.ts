import { PartialType } from '@nestjs/mapped-types';
import { CreateVoiceGuideDto } from './create-voice-guide.dto';

export class UpdateVoiceGuideDto extends PartialType(CreateVoiceGuideDto) {}