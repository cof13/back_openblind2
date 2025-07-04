import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsInt,
  IsPositive,
  IsDateString,
  IsBoolean,
  Matches
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStationScheduleDto {
  @ApiProperty({ 
    description: 'ID de la estación',
    example: 1
  })
  @IsInt()
  @IsPositive()
  id_estacion: number;

  @ApiProperty({ 
    description: 'Día de la semana',
    enum: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'],
    example: 'lunes'
  })
  @IsEnum(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'])
  dia_semana: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

  @ApiProperty({ 
    description: 'Hora de llegada (HH:MM)',
    example: '06:30'
  })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'La hora debe estar en formato HH:MM' })
  hora_llegada: string;

  @ApiProperty({ 
    description: 'Tipo de servicio',
    example: 'Regular',
    required: false
  })
  @IsOptional()
  @IsString()
  servicio?: string;

  @ApiProperty({ 
    description: 'Frecuencia en minutos',
    example: 5,
    required: false
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  frecuencia_minutos?: number;

  @ApiProperty({ 
    description: 'Fecha específica si aplica (YYYY-MM-DD)',
    example: '2024-12-25',
    required: false
  })
  @IsOptional()
  @IsDateString()
  fecha_especifica?: string;

  @ApiProperty({ 
    description: 'Si el horario está activo',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}