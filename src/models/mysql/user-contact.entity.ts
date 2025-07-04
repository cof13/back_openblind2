import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('usuarios_contactos')
@Index(['id_usuario', 'id_usuario_contacto'], { unique: true })
export class UserContact {
  @PrimaryGeneratedColumn()
  id_contacto: number;

  @Column({ type: 'int', comment: 'Usuario propietario' })
  id_usuario: number;

  @Column({ type: 'int', comment: 'Usuario contacto' })
  id_usuario_contacto: number;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Tipo de relación' })
  relacion: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_agregado: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario_contacto' })
  contact_user: User;
}
