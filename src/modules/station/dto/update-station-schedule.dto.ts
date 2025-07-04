import { PartialType } from '@nestjs/mapped-types';
import { CreateStationScheduleDto } from './create-station-schedule.dto';

export class UpdateStationScheduleDto extends PartialType(CreateStationScheduleDto) {}