import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Station } from './station.entity';

@Entity('estaciones_horarios')
@Index(['id_estacion', 'dia_semana', 'hora_llegada'])
export class StationSchedule {
  @PrimaryGeneratedColumn()
  id_horario: number;

  @Column({ type: 'int' })
  id_estacion: number;

  @Column({ type: 'enum', enum: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'] })
  dia_semana: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

  @Column({ type: 'time', comment: 'Hora de llegada' })
  hora_llegada: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Tipo de servicio' })
  servicio: string;

  @Column({ type: 'int', nullable: true, comment: 'Frecuencia en minutos' })
  frecuencia_minutos: number;

  @Column({ type: 'date', nullable: true, comment: 'Fecha específica si aplica' })
  fecha_especifica: Date;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_creacion: Date;

  @ManyToOne(() => Station, station => station.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_estacion' })
  station: Station;
}
