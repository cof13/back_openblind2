import { IsInt, IsOptional, IsString, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddReviewDto {
  @ApiProperty({ 
    description: 'Calificación del 1 al 10',
    example: 8,
    minimum: 1,
    maximum: 10
  })
  @IsInt()
  @Min(1)
  @Max(10)
  calificacion: number;

  @ApiProperty({ 
    description: 'Comentario opcional sobre la experiencia',
    example: 'Excelente lugar histórico, muy bien conservado.',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comentario?: string;
}