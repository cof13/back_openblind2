import { 
  IsString, 
  IsOptional, 
  IsInt,
  IsPositive,
  IsDecimal,
  MaxLength,
  MinLength,
  Min,
  Max,
  IsArray,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class DetalleEvaluacionDto {
  @ApiProperty({ description: 'Aspecto evaluado', example: 'Puntualidad' })
  @IsString()
  @MaxLength(100)
  aspecto: string;

  @ApiProperty({ description: 'Puntuación individual (0-10)', example: 8.5 })
  @IsDecimal({ decimal_digits: '1' })
  @Min(0)
  @Max(10)
  puntuacion_individual: number;

  @ApiProperty({ description: 'Comentario sobre el aspecto', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comentario?: string;
}

export class CreateServiceRatingDto {
  @ApiProperty({ 
    description: 'Nombre del servicio evaluado',
    example: 'Ecovía - Línea Norte'
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  servicio: string;

  @ApiProperty({ 
    description: 'Categoría del servicio',
    example: 'Transporte Público'
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  categoria: string;

  @ApiProperty({ 
    description: 'Puntuación general (0-10)',
    example: 8.5,
    minimum: 0,
    maximum: 10
  })
  @IsDecimal({ decimal_digits: '1' })
  @Min(0)
  @Max(10)
  puntuacion: number;

  @ApiProperty({ 
    description: 'Mes de evaluación (1-12)',
    example: 3,
    minimum: 1,
    maximum: 12
  })
  @IsInt()
  @Min(1)
  @Max(12)
  mes: number;

  @ApiProperty({ 
    description: 'Año de evaluación',
    example: 2024
  })
  @IsInt()
  @Min(2020)
  @Max(2030)
  anio: number;

  @ApiProperty({ 
    description: 'Observaciones adicionales',
    example: 'El servicio ha mejorado considerablemente en puntualidad.',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observaciones?: string;

  @ApiProperty({ 
    description: 'ID del usuario evaluador (se asigna automáticamente)',
    required: false
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id_usuario_evaluador?: number;

  // Campos MongoDB
  @ApiProperty({ 
    description: 'Detalles de evaluación por aspectos',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleEvaluacionDto)
  detalles_evaluacion?: { aspecto: string; puntuacion: number }[];
}
