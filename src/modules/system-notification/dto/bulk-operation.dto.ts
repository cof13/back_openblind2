import { IsArray, IsInt, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkMarkReadDto {
  @ApiProperty({ 
    description: 'IDs de las notificaciones a actualizar',
    example: [1, 2, 3, 4, 5]
  })
  @IsArray()
  @IsInt({ each: true })
  notification_ids: number[];

  @ApiProperty({ 
    description: 'Marcar como leída o no leída',
    example: true
  })
  @IsBoolean()
  leida: boolean;
}

export class BulkDeleteDto {
  @ApiProperty({ 
    description: 'IDs de las notificaciones a eliminar',
    example: [1, 2, 3, 4, 5]
  })
  @IsArray()
  @IsInt({ each: true })
  notification_ids: number[];
}
