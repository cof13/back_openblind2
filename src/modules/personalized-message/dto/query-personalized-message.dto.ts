import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryPersonalizedMessageDto {
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
  @IsEnum(['activo', 'inactivo'])
  estado?: 'activo' | 'inactivo';

  @IsOptional()
  @IsEnum(['informativo', 'advertencia', 'direccional'])
  tipo_mensaje?: 'informativo' | 'advertencia' | 'direccional';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_ruta?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_usuario_creador?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;
}