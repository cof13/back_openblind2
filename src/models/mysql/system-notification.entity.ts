import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('sistema_notificaciones')
@Index(['id_usuario_destinatario', 'leida'])
@Index(['tipo_notificacion'])
export class SystemNotification {
  @PrimaryGeneratedColumn()
  id_notificacion: number;

  @Column({ type: 'int', nullable: true, comment: 'null = notificación global' })
  id_usuario_destinatario: number | null;


  @Column({ type: 'varchar', length: 200 })
  titulo_notificacion: string;

  @Column({ type: 'text' })
  mensaje_notificacion: string;

  @Column({ type: 'enum', enum: ['info', 'success', 'warning', 'error'], default: 'info' })
  tipo_notificacion: 'info' | 'success' | 'warning' | 'error';

  @Column({ type: 'varchar', length: 100, nullable: true })
  entidad_relacionada: string;

  @Column({ type: 'int', nullable: true })
  entidad_id: number;

  @Column({ type: 'boolean', default: false })
  leida: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fecha_lectura: Date;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_creacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_expiracion: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario_destinatario' })
  user: User;
}
