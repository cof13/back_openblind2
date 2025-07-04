import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('mapas_interacciones')
@Index(['id_usuario', 'tipo_interaccion'])
@Index(['coordenadas'])
export class MapInteraction {
  @PrimaryGeneratedColumn()
  id_interaccion: number;

  @Column({ type: 'int' })
  id_usuario: number;

  @Column({ type: 'varchar', length: 50, comment: 'Tipo de interacción' })
  tipo_interaccion: string;

  @Column({ type: 'varchar', length: 100, comment: 'Coordenadas de la interacción' })
  coordenadas: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  entidad_relacionada: string;

  @Column({ type: 'int', nullable: true })
  entidad_id: number;

  @Column({ type: 'int', nullable: true })
  zoom_level: number;

  @Column({ type: 'json', nullable: true, comment: 'Datos adicionales del mapa' })
  datos_adicionales: string;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_interaccion: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  user: User;
}
