import { PartialType } from '@nestjs/swagger';
import { CreateTouristPointDto } from './create-tourist-point.dto';

export class UpdateTouristPointDto extends PartialType(CreateTouristPointDto) {}
