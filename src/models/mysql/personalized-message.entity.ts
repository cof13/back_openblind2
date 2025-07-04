import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Route } from './route.entity';
import { User } from './user.entity';
import { VoiceGuide } from './voice-guide.entity';
import { RouteMessage } from './route-message.entity';

@Entity('mensajes_personalizados')
@Index(['id_ruta'])
@Index(['estado'])
@Index(['tipo_mensaje'])
export class PersonalizedMessage {
  @PrimaryGeneratedColumn()
  id_mensaje: number;

  @Column({ type: 'text', comment: 'Contenido del mensaje' })
  mensaje: string;

  @Column({ type: 'int', nullable: true })
  id_ruta: number;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Coordenadas específicas' })
  coordenadas: string;

  @Column({ type: 'enum', enum: ['activo', 'inactivo'], default: 'activo' })
  estado: 'activo' | 'inactivo';

  @Column({ type: 'enum', enum: ['informativo', 'advertencia', 'direccional'], default: 'informativo' })
  tipo_mensaje: 'informativo' | 'advertencia' | 'direccional';

  @Column({ type: 'int', nullable: true })
  id_usuario_creador: number;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_creacion: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  fecha_actualizacion: Date;

  @Column({ type: 'varchar', length: 24, nullable: true, comment: 'ID contenido MongoDB' })
  content_mongo_id: string;

  @ManyToOne(() => Route, route => route.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_ruta' })
  route: Route;

  @ManyToOne(() => User, user => user.created_messages, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_usuario_creador' })
  creator: User;

  @OneToMany(() => VoiceGuide, voiceGuide => voiceGuide.message)
  voice_guides: VoiceGuide[];

  @OneToMany(() => RouteMessage, routeMessage => routeMessage.message)
  route_messages: RouteMessage[];
}
