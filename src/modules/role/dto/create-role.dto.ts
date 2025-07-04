// src/modules/role/dto/create-role.dto.ts
import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MaxLength(50)
  nombre_rol: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descripcion?: string;

  @IsOptional()
  @IsEnum(['activo', 'inactivo'])
  estado?: 'activo' | 'inactivo';
}