import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkReadDto {
  @ApiProperty({ 
    description: 'Marcar como leída o no leída',
    example: true
  })
  @IsBoolean()
  leida: boolean;
}