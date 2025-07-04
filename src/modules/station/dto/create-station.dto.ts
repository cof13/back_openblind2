import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsDateString,
  MaxLength,
  MinLength,
  IsUrl,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsObject
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ServiciosDto {
  @ApiProperty({ description: 'WiFi gratuito disponible', example: true })
  @IsOptional()
  @IsBoolean()
  wifi_gratuito?: boolean;

  @ApiProperty({ description: 'Baños disponibles', example: true })
  @IsOptional()
  @IsBoolean()
  baños?: boolean;

  @ApiProperty({ description: 'Ascensor disponible', example: false })
  @IsOptional()
  @IsBoolean()
  ascensor?: boolean;

  @ApiProperty({ description: 'Escaleras eléctricas disponibles', example: true })
  @IsOptional()
  @IsBoolean()
  escaleras_electricas?: boolean;

  @ApiProperty({ description: 'Estacionamiento disponible', example: false })
  @IsOptional()
  @IsBoolean()
  estacionamiento?: boolean;

  @ApiProperty({ description: 'Lista de comercios', example: ['Farmacia', 'Cafetería'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  comercios?: string[];
}

class AccesibilidadDto {
  @ApiProperty({ description: 'Rampa de acceso', example: true })
  @IsOptional()
  @IsBoolean()
  rampa_acceso?: boolean;

  @ApiProperty({ description: 'Señalización Braille', example: false })
  @IsOptional()
  @IsBoolean()
  señalizacion_braille?: boolean;

  @ApiProperty({ description: 'Audio informativo', example: true })
  @IsOptional()
  @IsBoolean()
  audio_informativo?: boolean;

  @ApiProperty({ description: 'Piso táctil', example: false })
  @IsOptional()
  @IsBoolean()
  piso_tactil?: boolean;

  @ApiProperty({ description: 'Asientos preferenciales', example: true })
  @IsOptional()
  @IsBoolean()
  asientos_preferenciales?: boolean;
}

class HorarioDto {
  @ApiProperty({ description: 'Hora de apertura', example: '05:00' })
  @IsString()
  apertura: string;

  @ApiProperty({ description: 'Hora de cierre', example: '23:00' })
  @IsString()
  cierre: string;
}

class HorariosOperacionDto {
  @ApiProperty({ description: 'Horarios de lunes a viernes' })
  @ValidateNested()
  @Type(() => HorarioDto)
  lunes_viernes: HorarioDto;

  @ApiProperty({ description: 'Horarios de sábados' })
  @ValidateNested()
  @Type(() => HorarioDto)
  sabados: HorarioDto;

  @ApiProperty({ description: 'Horarios de domingos' })
  @ValidateNested()
  @Type(() => HorarioDto)
  domingos: HorarioDto;
}

export class CreateStationDto {
  @ApiProperty({ 
    description: 'Nombre de la estación',
    example: 'Estación El Ejido',
    minLength: 3,
    maxLength: 150
  })
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  nombre_estacion: string;

  @ApiProperty({ 
    description: 'Tipo de transporte',
    enum: ['metro', 'bus', 'trolebus', 'ecovia'],
    example: 'metro'
  })
  @IsEnum(['metro', 'bus', 'trolebus', 'ecovia'])
  tipo_transporte: 'metro' | 'bus' | 'trolebus' | 'ecovia';

  @ApiProperty({ 
    description: 'Coordenadas de la estación (lat,lng)',
    example: '-0.2058,78.5014'
  })
  @IsString()
  @MaxLength(100)
  coordenadas: string;

  @ApiProperty({ 
    description: 'Dirección de la estación',
    example: 'Av. 6 de Diciembre y Av. Patria',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccion?: string;

  @ApiProperty({ 
    description: 'Estado operativo de la estación',
    enum: ['operativa', 'mantenimiento', 'cerrada'],
    example: 'operativa',
    default: 'operativa'
  })
  @IsOptional()
  @IsEnum(['operativa', 'mantenimiento', 'cerrada'])
  estado_operativo?: 'operativa' | 'mantenimiento' | 'cerrada';

  @ApiProperty({ 
    description: 'URL de imagen de la estación',
    example: 'https://openblind.com/images/estacion-ejido.jpg',
    required: false
  })
  @IsOptional()
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  imagen_url?: string;

  @ApiProperty({ 
    description: 'Fecha de inauguración (YYYY-MM-DD)',
    example: '1995-12-15',
    required: false
  })
  @IsOptional()
  @IsDateString()
  fecha_inauguracion?: string;

  // Campos MongoDB
  @ApiProperty({ 
    description: 'Servicios disponibles en la estación',
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ServiciosDto)
  servicios?: ServiciosDto;

  @ApiProperty({ 
    description: 'Información de accesibilidad',
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AccesibilidadDto)
  accesibilidad?: AccesibilidadDto;

  @ApiProperty({ 
    description: 'Horarios de operación',
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => HorariosOperacionDto)
  horarios_operacion?: HorariosOperacionDto;
}