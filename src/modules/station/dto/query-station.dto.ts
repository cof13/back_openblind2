import { IsOptional, IsEnum, IsString, IsInt, Min, IsNumberString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryStationDto {
  @ApiProperty({ description: 'Número de página', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Elementos por página', example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ 
    description: 'Filtrar por estado operativo',
    enum: ['operativa', 'mantenimiento', 'cerrada'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['operativa', 'mantenimiento', 'cerrada'])
  estado_operativo?: 'operativa' | 'mantenimiento' | 'cerrada';

  @ApiProperty({ 
    description: 'Filtrar por tipo de transporte',
    enum: ['metro', 'bus', 'trolebus', 'ecovia'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['metro', 'bus', 'trolebus', 'ecovia'])
  tipo_transporte?: 'metro' | 'bus' | 'trolebus' | 'ecovia';

  @ApiProperty({ 
    description: 'Buscar por nombre o dirección',
    example: 'El Ejido',
    required: false 
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiProperty({ 
    description: 'Latitud para búsqueda por proximidad',
    example: '-0.2058',
    required: false 
  })
  @IsOptional()
  @IsNumberString()
  lat?: string;

  @ApiProperty({ 
    description: 'Longitud para búsqueda por proximidad',
    example: '78.5014',
    required: false 
  })
  @IsOptional()
  @IsNumberString()
  lng?: string;

  @ApiProperty({ 
    description: 'Radio de búsqueda en kilómetros',
    example: '2',
    required: false 
  })
  @IsOptional()
  @IsNumberString()
  radius?: string;
}