import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsInt,
  IsPositive,
  IsDecimal,
  MaxLength,
  MinLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRouteDto {
  @ApiProperty({ 
    description: 'Nombre de la ruta',
    example: 'Ruta Ecovía Norte-Sur' 
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  nombre_ruta: string;

  @ApiProperty({ 
    description: 'Ubicación detallada de la ruta',
    example: 'Desde Rio Coca hasta Terminal Quitumbe'
  })
  @IsString()
  @MaxLength(1000)
  ubicacion_ruta: string;

  @ApiProperty({ 
    description: 'Nombre del transporte',
    example: 'Ecovía'
  })
  @IsString()
  @MaxLength(200)
  nombre_transporte: string;

  @ApiProperty({ 
    description: 'Coordenadas de inicio',
    example: '-0.1807,78.4678',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  coordenadas_inicio?: string;

  @ApiProperty({ 
    description: 'Coordenadas de fin',
    example: '-0.2897,78.5233',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  coordenadas_fin?: string;

  @ApiProperty({ 
    description: 'Distancia en kilómetros',
    example: 35.5,
    required: false
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  distancia_km?: number;

  @ApiProperty({ 
    description: 'Tiempo estimado en minutos',
    example: 90,
    required: false
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  tiempo_estimado_min?: number;

  @ApiProperty({ 
    description: 'ID del usuario creador (se asigna automáticamente)',
    required: false
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id_usuario_creador?: number;

  @ApiProperty({ 
    description: 'Estado de la ruta',
    enum: ['activo', 'inactivo', 'en_revision'],
    example: 'activo'
  })
  @IsOptional()
  @IsEnum(['activo', 'inactivo', 'en_revision'])
  estado?: 'activo' | 'inactivo' | 'en_revision';

  // Campos adicionales para MongoDB
  @ApiProperty({ 
    description: 'Descripción detallada',
    required: false
  })
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ 
    description: 'Puntos intermedios de la ruta',
    required: false
  })
  @IsOptional()
  puntos_intermedios?: Array<{
    nombre: string;
    coordenadas: string;
    descripcion?: string;
    orden: number;
    tiempo_estimado_llegada?: number;
    es_parada_obligatoria: boolean;
  }>;

  @ApiProperty({ 
    description: 'Horarios de servicio',
    required: false
  })
  @IsOptional()
  horarios_servicio?: Array<{
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    frecuencia_min: number;
  }>;

  @ApiProperty({ 
    description: 'Información de accesibilidad',
    required: false
  })
  @IsOptional()
  informacion_accesibilidad?: {
    rampa_acceso: boolean;
    audio_informativo: boolean;
    señalizacion_braille: boolean;
    ascensor: boolean;
    piso_tactil: boolean;
    asientos_preferenciales: boolean;
  };
}
