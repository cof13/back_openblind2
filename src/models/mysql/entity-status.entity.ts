import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('entidades_estados')
@Index(['entidad_tipo', 'entidad_id'])
@Index(['estado_actual'])
export class EntityStatus {
  @PrimaryGeneratedColumn()
  id_estado: number;

  @Column({ type: 'varchar', length: 50, comment: 'Tipo de entidad' })
  entidad_tipo: string;

  @Column({ type: 'int', comment: 'ID de la entidad' })
  entidad_id: number;

  @Column({ type: 'enum', enum: ['activo', 'inactivo', 'pendiente', 'eliminado'], default: 'activo' })
  estado_actual: 'activo' | 'inactivo' | 'pendiente' | 'eliminado';

  @Column({ type: 'enum', enum: ['activo', 'inactivo', 'pendiente', 'eliminado'], nullable: true })
  estado_anterior: 'activo' | 'inactivo' | 'pendiente' | 'eliminado';

  @Column({ type: 'int', nullable: true })
  cambiado_por: number;

  @Column({ type: 'text', nullable: true })
  motivo_cambio: string;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_cambio: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cambiado_por' })
  changed_by: User;
}
