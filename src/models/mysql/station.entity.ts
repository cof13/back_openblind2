import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { RouteStation } from './route-station.entity';
import { StationSchedule } from './station-schedule.entity';

@Entity('estaciones')
@Index(['tipo_transporte'])
@Index(['estado_operativo'])
@Index(['coordenadas'])
export class Station {
  @PrimaryGeneratedColumn()
  id_estacion: number;

  @Column({ type: 'varchar', length: 150, comment: 'Nombre de la estación' })
  nombre_estacion: string;

  @Column({ type: 'enum', enum: ['metro', 'bus', 'trolebus', 'ecovia'] })
  tipo_transporte: 'metro' | 'bus' | 'trolebus' | 'ecovia';

  @Column({ type: 'varchar', length: 100, comment: 'Coordenadas lat,lng' })
  coordenadas: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ type: 'enum', enum: ['operativa', 'mantenimiento', 'cerrada'], default: 'operativa' })
  estado_operativo: 'operativa' | 'mantenimiento' | 'cerrada';

  @Column({ type: 'varchar', length: 255, nullable: true })
  imagen_url: string;

  @Column({ type: 'date', nullable: true })
  fecha_inauguracion: Date;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_registro: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  fecha_actualizacion: Date;

  @Column({ type: 'varchar', length: 24, nullable: true, comment: 'ID detalles MongoDB' })
  details_mongo_id: string;

  @OneToMany(() => RouteStation, routeStation => routeStation.station)
  route_stations: RouteStation[];

  @OneToMany(() => StationSchedule, schedule => schedule.station)
  schedules: StationSchedule[];
}
