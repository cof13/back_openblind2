import { PartialType } from '@nestjs/swagger';
import { CreatePersonalizedMessageDto } from './create-personalized-message.dto';

export class UpdatePersonalizedMessageDto extends PartialType(CreatePersonalizedMessageDto) {}
