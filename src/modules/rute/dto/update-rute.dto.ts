import { PartialType } from '@nestjs/swagger';
import { CreateRouteDto } from './create-rute.dto';

export class UpdateRouteDto extends PartialType(CreateRouteDto) {}
