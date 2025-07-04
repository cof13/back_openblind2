import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('usuarios_telefonos')
@Index(['numero_telefono'])
@Index(['id_usuario'])
export class UserPhone {
  @PrimaryGeneratedColumn()
  id_telefono: number;

  @Column({ type: 'int' })
  id_usuario: number;

  @Column({ type: 'varchar', length: 20, comment: 'Número de teléfono' })
  numero_telefono: string;

  @Column({ type: 'enum', enum: ['principal', 'secundario', 'trabajo', 'emergencia'], default: 'principal' })
  tipo_telefono: 'principal' | 'secundario' | 'trabajo' | 'emergencia';

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_agregado: Date;

  @ManyToOne(() => User, user => user.phones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  user: User;
}
