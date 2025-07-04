import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryUserDto {
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
  @IsEnum(['activo', 'inactivo', 'suspendido'])
  estado?: 'activo' | 'inactivo' | 'suspendido';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_rol?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string; // Para buscar por nombre, apellido o email
}