import { IsOptional, IsEnum, IsString, IsInt, Min, IsNumberString, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryTouristPointDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['activo', 'inactivo', 'pendiente_aprobacion'])
  estado?: 'activo' | 'inactivo' | 'pendiente_aprobacion';

  @IsOptional()
  @IsEnum(['historico', 'cultural', 'recreativo', 'comercial', 'transporte'])
  categoria?: 'historico' | 'cultural' | 'recreativo' | 'comercial' | 'transporte';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_usuario_creador?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsNumberString()
  lat?: string;

  @IsOptional()
  @IsNumberString()
  lng?: string;

  @IsOptional()
  @IsNumberString()
  radius?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  min_rating?: number;
}
