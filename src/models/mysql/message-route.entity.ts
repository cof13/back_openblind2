import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { PersonalizedMessage } from './personalized-message.entity';
import { Route } from './route.entity';

@Entity('mensajes_rutas')
@Index(['id_mensaje', 'id_ruta'], { unique: true })
export class MessageRoute {
  @PrimaryGeneratedColumn()
  id_mensaje_ruta: number;

  @Column({ type: 'int' })
  id_mensaje: number;

  @Column({ type: 'int' })
  id_ruta: number;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Coordenadas de activación' })
  punto_activacion: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_asignacion: Date;

  @ManyToOne(() => PersonalizedMessage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_mensaje' })
  message: PersonalizedMessage;

  @ManyToOne(() => Route, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_ruta' })
  route: Route;
}
