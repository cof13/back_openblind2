import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsInt,
  IsPositive,
  IsUrl,
  Min,
  Max
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVoiceGuideDto {
  @ApiProperty({ 
    description: 'ID de la ruta asociada',
    example: 1
  })
  @IsInt()
  @IsPositive()
  id_ruta: number;

  @ApiProperty({ 
    description: 'ID del mensaje asociado',
    example: 1
  })
  @IsInt()
  @IsPositive()
  id_mensaje: number;

  @ApiProperty({ 
    description: 'URL del archivo de audio',
    example: 'https://openblind.com/audio/mensaje1.mp3'
  })
  @IsString()
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  archivo_audio_url: string;

  @ApiProperty({ 
    description: 'Duración en segundos',
    example: 30,
    minimum: 1,
    maximum: 600
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(600)
  duracion_segundos?: number;

  @ApiProperty({ 
    description: 'Idioma del audio',
    enum: ['es', 'en', 'qu'],
    example: 'es'
  })
  @IsOptional()
  @IsEnum(['es', 'en', 'qu'])
  idioma?: string;

  @ApiProperty({ 
    description: 'Velocidad de reproducción',
    enum: ['lenta', 'normal', 'rapida'],
    example: 'normal'
  })
  @IsOptional()
  @IsEnum(['lenta', 'normal', 'rapida'])
  velocidad_reproduccion?: 'lenta' | 'normal' | 'rapida';

  @ApiProperty({ 
    description: 'Estado de la guía de voz',
    enum: ['activo', 'inactivo', 'procesando'],
    example: 'procesando'
  })
  @IsOptional()
  @IsEnum(['activo', 'inactivo', 'procesando'])
  estado?: 'activo' | 'inactivo' | 'procesando';

  // Campos adicionales para MongoDB
  @ApiProperty({ 
    description: 'Metadatos del audio',
    required: false
  })
  @IsOptional()
  metadatos_audio?: {
    formato: string;
    calidad: string;
    tamaño_mb?: number;
  };
}