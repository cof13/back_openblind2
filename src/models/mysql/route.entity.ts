import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { PersonalizedMessage } from './personalized-message.entity';
import { RouteStation } from './route-station.entity';
import { RouteMessage } from './route-message.entity';

@Entity('rutas')
@Index(['estado'])
@Index(['id_usuario_creador'])
export class Route {
  @PrimaryGeneratedColumn()
  id_ruta: number;

  @Column({ type: 'varchar', length: 200, comment: 'Nombre de la ruta' })
  nombre_ruta: string;

  @Column({ type: 'text', comment: 'Ubicación detallada de la ruta' })
  ubicacion_ruta: string;

  @Column({ type: 'varchar', length: 200, comment: 'Nombre del transporte' })
  nombre_transporte: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Coordenadas inicio' })
  coordenadas_inicio: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Coordenadas fin' })
  coordenadas_fin: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  distancia_km: number;

  @Column({ type: 'int', nullable: true, comment: 'Tiempo estimado en minutos' })
  tiempo_estimado_min: number;

  @Column({ type: 'int', nullable: true })
  id_usuario_creador: number;

  @Column({ type: 'enum', enum: ['activo', 'inactivo', 'en_revision'], default: 'activo' })
  estado: 'activo' | 'inactivo' | 'en_revision';

  @CreateDateColumn({ type: 'timestamp' })
  fecha_creacion: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  fecha_actualizacion: Date;

  @Column({ type: 'varchar', length: 24, nullable: true, comment: 'ID detalles MongoDB' })
  details_mongo_id: string;

  @ManyToOne(() => User, user => user.created_routes, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_usuario_creador' })
  creator: User;

  @OneToMany(() => PersonalizedMessage, message => message.route)
  messages: PersonalizedMessage[];

  @OneToMany(() => RouteStation, routeStation => routeStation.route)
  route_stations: RouteStation[];

  @OneToMany(() => RouteMessage, routeMessage => routeMessage.route)
  route_messages: RouteMessage[];
}
