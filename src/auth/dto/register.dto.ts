// src/modules/auth/dto/register.dto.ts
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
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    description: 'Nombres del usuario',
    example: 'Juan Carlos' 
  })
  @IsString()
  @MaxLength(100, { message: 'Los nombres no pueden exceder 100 caracteres' })
  nombres: string;

  @ApiProperty({ 
    description: 'Apellidos del usuario',
    example: 'Pérez González' 
  })
  @IsString()
  @MaxLength(100, { message: 'Los apellidos no pueden exceder 100 caracteres' })
  apellidos: string;

  @ApiProperty({ 
    description: 'Email del usuario',
    example: 'juan.perez@email.com' 
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @MaxLength(150, { message: 'El email no puede exceder 150 caracteres' })
  email: string;

  @ApiProperty({ 
    description: 'Contraseña del usuario',
    example: 'MiPassword123!',
    minLength: 8,
    maxLength: 255
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(255, { message: 'La contraseña no puede exceder 255 caracteres' })
  password: string;

  @ApiProperty({ 
    description: 'Número de teléfono (opcional)',
    example: '+593987654321',
    required: false
  })
  @IsOptional()
  @IsPhoneNumber('EC', { message: 'Debe ser un número de teléfono válido de Ecuador' })
  telefono?: string;

  @ApiProperty({ 
    description: 'Fecha de nacimiento (opcional)',
    example: '1990-01-15',
    required: false
  })
  @IsOptional()
  @IsDateString({}, { message: 'Debe ser una fecha válida (YYYY-MM-DD)' })
  fecha_nacimiento?: string;

  @ApiProperty({ 
    description: 'ID del rol asignado (opcional, por defecto Usuario Estándar)',
    example: 6,
    required: false
  })
  @IsOptional()
  @IsInt({ message: 'El ID del rol debe ser un número entero' })
  @IsPositive({ message: 'El ID del rol debe ser positivo' })
  id_rol?: number;

  @ApiProperty({ 
    description: 'Estado del usuario (opcional)',
    example: 'activo',
    enum: ['activo', 'inactivo', 'suspendido'],
    required: false
  })
  @IsOptional()
  @IsEnum(['activo', 'inactivo', 'suspendido'], { 
    message: 'El estado debe ser: activo, inactivo o suspendido' 
  })
  estado?: 'activo' | 'inactivo' | 'suspendido';
}

