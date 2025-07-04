import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('usuarios_actividad')
@Index(['id_usuario', 'fecha_actividad'])
@Index(['tipo_actividad'])
export class UserActivity {
  @PrimaryGeneratedColumn()
  id_actividad: number;

  @Column({ type: 'int' })
  id_usuario: number;

  @Column({ type: 'varchar', length: 100, comment: 'Tipo de actividad' })
  tipo_actividad: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  descripcion_actividad: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  entidad_relacionada: string;

  @Column({ type: 'int', nullable: true })
  entidad_id: number;

  @Column({ type: 'timestamp', comment: 'Fecha específica de la actividad' })
  fecha_actividad: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_registro: Date;

  @ManyToOne(() => User, user => user.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  user: User;
}
