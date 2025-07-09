import { IsOptional, IsEnum, IsString, IsInt, Min, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QuerySystemNotificationDto {
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
  @Type(() => Number)
  @IsInt()
  id_usuario_destinatario?: number;

  @IsOptional()
  @IsEnum(['info', 'success', 'warning', 'error'])
  tipo_notificacion?: 'info' | 'success' | 'warning' | 'error';

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  leida?: boolean;

  @IsOptional()
  @IsString()
  entidad_relacionada?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  entidad_id?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  global?: boolean; // Para filtrar notificaciones globales

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  include_expired?: boolean; // Para incluir notificaciones expiradas
}