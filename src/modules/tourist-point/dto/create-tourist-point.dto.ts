import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsInt,
  IsPositive,
  IsDecimal,
  MaxLength,
  MinLength,
  IsUrl,
  IsArray,
  ValidateNested,
  IsBoolean,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AccesibilidadDto {
  @ApiProperty({ description: 'Rampa de acceso', example: true })
  @IsOptional()
  @IsBoolean()
  rampa_acceso?: boolean;

  @ApiProperty({ description: 'Baño adaptado', example: false })
  @IsOptional()
  @IsBoolean()
  baño_adaptado?: boolean;

  @ApiProperty({ description: 'Estacionamiento', example: true })
  @IsOptional()
  @IsBoolean()
  estacionamiento?: boolean;

  @ApiProperty({ description: 'Transporte público', example: true })
  @IsOptional()
  @IsBoolean()
  transporte_publico?: boolean;
}

class InformacionDetalladaDto {
  @ApiProperty({ description: 'Historia del lugar', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  historia?: string;

  @ApiProperty({ description: 'Horarios de atención', example: 'Lunes a Viernes: 9:00 - 17:00', required: false })
  @IsOptional()
  @IsString()
  horarios_atencion?: string;

  @ApiProperty({ description: 'Precio de entrada', example: 'Gratuito', required: false })
  @IsOptional()
  @IsString()
  precio_entrada?: string;

  @ApiProperty({ description: 'Servicios disponibles', example: ['WiFi', 'Guía turística'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  servicios_disponibles?: string[];

  @ApiProperty({ description: 'Información de accesibilidad', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AccesibilidadDto)
  accesibilidad?: AccesibilidadDto;
}

export class CreateTouristPointDto {
  @ApiProperty({ 
    description: 'Lugar de destino',
    example: 'Centro Histórico de Quito'
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  lugar_destino: string;

  @ApiProperty({ 
    description: 'Nombre específico del punto turístico',
    example: 'Plaza de la Independencia'
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  nombre: string;

  @ApiProperty({ 
    description: 'Descripción detallada del punto turístico',
    example: 'La Plaza de la Independencia es el corazón del Centro Histórico de Quito...'
  })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  descripcion: string;

  @ApiProperty({ 
    description: 'Coordenadas del punto turístico (lat,lng)',
    example: '-0.2201,78.5124'
  })
  @IsString()
  @MaxLength(100)
  coordenadas: string;

  @ApiProperty({ 
    description: 'Dirección del punto turístico',
    example: 'Venezuela y Espejo, Centro Histórico',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccion?: string;

  @ApiProperty({ 
    description: 'Categoría del punto turístico',
    enum: ['historico', 'cultural', 'recreativo', 'comercial', 'transporte'],
    example: 'historico'
  })
  @IsOptional()
  @IsEnum(['historico', 'cultural', 'recreativo', 'comercial', 'transporte'])
  categoria?: 'historico' | 'cultural' | 'recreativo' | 'comercial' | 'transporte';

  @ApiProperty({ 
    description: 'Calificación promedio (0-10)',
    example: 8.5,
    required: false
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  @Max(10)
  calificacion_promedio?: number;

  @ApiProperty({ 
    description: 'URL de imagen principal',
    example: 'https://openblind.com/images/plaza-independencia.jpg',
    required: false
  })
  @IsOptional()
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  imagen_url?: string;

  @ApiProperty({ 
    description: 'ID del usuario creador (se asigna automáticamente)',
    required: false
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id_usuario_creador?: number;

  @ApiProperty({ 
    description: 'Estado del punto turístico',
    enum: ['activo', 'inactivo', 'pendiente_aprobacion'],
    example: 'pendiente_aprobacion'
  })
  @IsOptional()
  @IsEnum(['activo', 'inactivo', 'pendiente_aprobacion'])
  estado?: 'activo' | 'inactivo' | 'pendiente_aprobacion';

  // Campos MongoDB
  @ApiProperty({ 
    description: 'Imágenes adicionales del punto turístico',
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagenes?: string[];

  @ApiProperty({ 
    description: 'Información detallada del punto turístico',
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => InformacionDetalladaDto)
  informacion_detallada?: InformacionDetalladaDto;

  @ApiProperty({ 
    description: 'Reseñas de usuarios',
    required: false
  })
  @IsOptional()
  reviews?: Array<{
    usuario_id: number;
    calificacion: number;
    comentario?: string;
    fecha: Date;
  }>;
}