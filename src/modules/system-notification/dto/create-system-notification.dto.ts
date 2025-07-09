import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsInt,
  IsPositive,
  IsBoolean,
  IsDateString,
  MaxLength,
  MinLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSystemNotificationDto {
  @ApiProperty({ 
    description: 'ID del usuario destinatario (null para notificación global)',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id_usuario_destinatario?: number;

  @ApiProperty({ 
    description: 'Título de la notificación',
    example: 'Nueva ruta disponible'
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  titulo_notificacion: string;

  @ApiProperty({ 
    description: 'Mensaje de la notificación',
    example: 'Se ha agregado una nueva ruta de transporte: Metro Línea 1'
  })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  mensaje_notificacion: string;

  @ApiProperty({ 
    description: 'Tipo de notificación',
    enum: ['info', 'success', 'warning', 'error'],
    example: 'info'
  })
  @IsOptional()
  @IsEnum(['info', 'success', 'warning', 'error'])
  tipo_notificacion?: 'info' | 'success' | 'warning' | 'error';

  @ApiProperty({ 
    description: 'Entidad relacionada (opcional)',
    example: 'Route',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  entidad_relacionada?: string;

  @ApiProperty({ 
    description: 'ID de la entidad relacionada (opcional)',
    example: 15,
    required: false
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  entidad_id?: number;

  @ApiProperty({ 
    description: 'Si la notificación está marcada como leída',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  leida?: boolean;

  @ApiProperty({ 
    description: 'Fecha de expiración (opcional)',
    example: '2024-12-31T23:59:59.999Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  fecha_expiracion?: string;
}