import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Route } from './route.entity';
import { PersonalizedMessage } from './personalized-message.entity';

@Entity('guias_voz')
@Index(['id_ruta'])
@Index(['id_mensaje'])
@Index(['estado'])
export class VoiceGuide {
  @PrimaryGeneratedColumn()
  id_guia: number;

  @Column({ type: 'int' })
  id_ruta: number;

  @Column({ type: 'int' })
  id_mensaje: number;

  @Column({ type: 'varchar', length: 255, comment: 'URL del archivo de audio' })
  archivo_audio_url: string;

  @Column({ type: 'int', nullable: true })
  duracion_segundos: number;

  @Column({ type: 'varchar', length: 10, default: 'es' })
  idioma: string;

  @Column({ type: 'enum', enum: ['lenta', 'normal', 'rapida'], default: 'normal' })
  velocidad_reproduccion: 'lenta' | 'normal' | 'rapida';

  @Column({ type: 'enum', enum: ['activo', 'inactivo', 'procesando'], default: 'procesando' })
  estado: 'activo' | 'inactivo' | 'procesando';

  @Column({ type: 'date', comment: 'Fecha de registro del audio' })
  fecha_registro: Date;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_creacion: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  fecha_actualizacion: Date;

  @ManyToOne(() => Route, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_ruta' })
  route: Route;

  @ManyToOne(() => PersonalizedMessage, message => message.voice_guides, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_mensaje' })
  message: PersonalizedMessage;
}
