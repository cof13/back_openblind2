import { Exclude, Expose, Type } from 'class-transformer';

class RoleResponseDto {
  @Expose()
  id_rol: number;

  @Expose()
  nombre_rol: string;

  @Expose()
  descripcion: string;

  @Expose()
  estado: string;
}

export class UserResponseDto {
  @Expose()
  id_usuario: number;

  @Expose()
  nombres: string;

  @Expose()
  apellidos: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  telefono: string;

  @Expose()
  fecha_nacimiento: Date;

  @Expose()
  estado: string;

  @Expose()
  fecha_registro: Date;

  @Expose()
  fecha_actualizacion: Date;

  @Expose()
  ultimo_acceso: Date;

  @Expose()
  @Type(() => RoleResponseDto)
  role: RoleResponseDto;

  @Expose()
  get fullName(): string {
    return `${this.nombres} ${this.apellidos}`;
  }

  @Expose()
  get isActive(): boolean {
    return this.estado === 'activo';
  }
}
