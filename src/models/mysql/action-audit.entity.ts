import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('acciones_auditoria')
@Index(['id_usuario', 'fecha_accion'])
@Index(['entidad_tipo', 'entidad_id'])
@Index(['accion'])
export class ActionAudit {
  @PrimaryGeneratedColumn()
  id_auditoria: number;

  @Column({ type: 'int' })
  id_usuario: number;

  @Column({ type: 'varchar', length: 50, comment: 'Acción realizada' })
  accion: string;

  @Column({ type: 'varchar', length: 50, comment: 'Tipo de entidad afectada' })
  entidad_tipo: string;

  @Column({ type: 'int', comment: 'ID de la entidad afectada' })
  entidad_id: number;

  @Column({ type: 'json', nullable: true, comment: 'Datos antes del cambio' })
  datos_anteriores: string;

  @Column({ type: 'json', nullable: true, comment: 'Datos después del cambio' })
  datos_nuevos: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_accion: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  user: User;
}
