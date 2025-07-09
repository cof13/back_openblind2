import { PartialType } from '@nestjs/swagger';
import { CreateSystemNotificationDto } from './create-system-notification.dto';

export class UpdateSystemNotificationDto extends PartialType(CreateSystemNotificationDto) {}
