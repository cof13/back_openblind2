import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Route } from './route.entity';
import { PersonalizedMessage } from './personalized-message.entity';

@Entity('rutas_mensajes')
@Index(['id_ruta', 'orden_reproduccion'], { unique: true })
export class RouteMessage {
  @PrimaryGeneratedColumn()
  id_ruta_mensaje: number;

  @Column({ type: 'int' })
  id_ruta: number;

  @Column({ type: 'int' })
  id_mensaje: number;

  @Column({ type: 'int', comment: 'Orden de reproducción' })
  orden_reproduccion: number;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Punto de activación' })
  punto_activacion: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  distancia_km: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_asignacion: Date;

  @ManyToOne(() => Route, route => route.route_messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_ruta' })
  route: Route;

  @ManyToOne(() => PersonalizedMessage, message => message.route_messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_mensaje' })
  message: PersonalizedMessage;
}
