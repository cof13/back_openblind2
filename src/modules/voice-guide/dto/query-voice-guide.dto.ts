import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryVoiceGuideDto {
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
  @IsEnum(['activo', 'inactivo', 'procesando'])
  estado?: 'activo' | 'inactivo' | 'procesando';

  @IsOptional()
  @IsEnum(['es', 'en', 'qu'])
  idioma?: 'es' | 'en' | 'qu';

  @IsOptional()
  @IsEnum(['lenta', 'normal', 'rapida'])
  velocidad_reproduccion?: 'lenta' | 'normal' | 'rapida';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_ruta?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_mensaje?: number;
}