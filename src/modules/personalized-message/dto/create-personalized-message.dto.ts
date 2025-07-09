import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsInt,
  IsPositive,
  MaxLength,
  MinLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonalizedMessageDto {
  @ApiProperty({ 
    description: 'Contenido del mensaje',
    example: 'Próxima estación: El Ejido. Conexión con Ecovía disponible.'
  })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  mensaje: string;

  @ApiProperty({ 
    description: 'ID de la ruta asociada (opcional)',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id_ruta?: number;

  @ApiProperty({ 
    description: 'Coordenadas específicas donde se reproduce el mensaje',
    example: '-0.2058,78.5014',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  coordenadas?: string;

  @ApiProperty({ 
    description: 'Estado del mensaje',
    enum: ['activo', 'inactivo'],
    example: 'activo'
  })
  @IsOptional()
  @IsEnum(['activo', 'inactivo'])
  estado?: 'activo' | 'inactivo';

  @ApiProperty({ 
    description: 'Tipo de mensaje',
    enum: ['informativo', 'advertencia', 'direccional'],
    example: 'informativo'
  })
  @IsOptional()
  @IsEnum(['informativo', 'advertencia', 'direccional'])
  tipo_mensaje?: 'informativo' | 'advertencia' | 'direccional';

  @ApiProperty({ 
    description: 'ID del usuario creador (se asigna automáticamente)',
    required: false
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id_usuario_creador?: number;

  // Campos MongoDB
  @ApiProperty({ 
    description: 'Traducciones del mensaje',
    required: false
  })
  @IsOptional()
  traducciones?: Array<{
    idioma: string;
    texto: string;
    estado: string;
  }>;

  @ApiProperty({ 
    description: 'Archivos de audio por idioma',
    required: false
  })
  @IsOptional()
  audio_files?: {
    es?: string;
    en?: string;
    qu?: string;
  };

  @ApiProperty({ 
    description: 'Configuración de audio',
    required: false
  })
  @IsOptional()
  configuracion_audio?: {
    velocidad_normal?: string;
    velocidad_lenta?: string;
    velocidad_rapida?: string;
    duracion_segundos?: number;
    formato_audio: string;
  };

  @ApiProperty({ 
    description: 'Contexto de ubicación',
    required: false
  })
  @IsOptional()
  contexto_ubicacion?: {
    descripcion_entorno?: string;
    puntos_referencia?: string[];
    direcciones_disponibles?: string[];
  };
}
