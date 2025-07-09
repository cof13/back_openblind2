import { PartialType } from '@nestjs/swagger';
import { CreateServiceRatingDto } from './create-service-rating.dto';

export class UpdateServiceRatingDto extends PartialType(CreateServiceRatingDto) {}
