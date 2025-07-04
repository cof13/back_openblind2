import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('calificaciones_servicio')
@Index(['servicio'])
@Index(['anio', 'mes'])
export class ServiceRating {
  @PrimaryGeneratedColumn()
  id_calificacion: number;

  @Column({ type: 'varchar', length: 100, comment: 'Nombre del servicio' })
  servicio: string;

  @Column({ type: 'varchar', length: 50, comment: 'Categoría evaluada' })
  categoria: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, comment: 'Puntuación 0-10' })
  puntuacion: number;

  @Column({ type: 'int', comment: 'Mes de evaluación 1-12' })
  mes: number;

  @Column({ type: 'int', comment: 'Año de evaluación' })
  anio: number;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'int', nullable: true })
  id_usuario_evaluador: number;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_evaluacion: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_usuario_evaluador' })
  evaluator: User;
}
