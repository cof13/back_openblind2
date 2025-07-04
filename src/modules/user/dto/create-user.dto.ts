// src/modules/user/dto/create-user.dto.ts
import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsEnum, 
  IsDateString, 
  MaxLength, 
  MinLength,
  IsPhoneNumber,
  IsInt,
  IsPositive
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MaxLength(100)
  nombres: string;

  @IsString()
  @MaxLength(100)
  apellidos: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password: string;

  @IsOptional()
  @IsPhoneNumber('EC') // Código de país para Ecuador
  telefono?: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;

  @IsInt()
  @IsPositive()
  id_rol: number;

  @IsOptional()
  @IsEnum(['activo', 'inactivo', 'suspendido'])
  estado?: 'activo' | 'inactivo' | 'suspendido';
}
