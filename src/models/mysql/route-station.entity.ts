import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Route } from './route.entity';
import { Station } from './station.entity';

@Entity('rutas_estaciones')
@Index(['id_ruta', 'orden_parada'], { unique: true })
export class RouteStation {
  @PrimaryGeneratedColumn()
  id_ruta_estacion: number;

  @Column({ type: 'int' })
  id_ruta: number;

  @Column({ type: 'int' })
  id_estacion: number;

  @Column({ type: 'int', comment: 'Orden en la ruta' })
  orden_parada: number;

  @Column({ type: 'time', nullable: true, comment: 'Hora estimada de llegada' })
  tiempo_llegada_estimado: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  distancia_anterior_km: number;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_asignacion: Date;

  @ManyToOne(() => Route, route => route.route_stations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_ruta' })
  route: Route;

  @ManyToOne(() => Station, station => station.route_stations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_estacion' })
  station: Station;
}
