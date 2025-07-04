import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryRouteDto {
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
  @IsEnum(['activo', 'inactivo', 'en_revision'])
  estado?: 'activo' | 'inactivo' | 'en_revision';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_usuario_creador?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsString()
  nombre_transporte?: string;
}
