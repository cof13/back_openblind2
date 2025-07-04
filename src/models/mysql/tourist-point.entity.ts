import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('puntos_turisticos')
@Index(['categoria'])
@Index(['estado'])
@Index(['coordenadas'])
export class TouristPoint {
  @PrimaryGeneratedColumn()
  id_punto: number;

  @Column({ type: 'varchar', length: 200, comment: 'Lugar de destino' })
  lugar_destino: string;

  @Column({ type: 'varchar', length: 200, comment: 'Nombre específico' })
  nombre: string;

  @Column({ type: 'text', comment: 'Descripción detallada' })
  descripcion: string;

  @Column({ type: 'varchar', length: 100, comment: 'Coordenadas lat,lng' })
  coordenadas: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ type: 'enum', enum: ['historico', 'cultural', 'recreativo', 'comercial', 'transporte'], default: 'cultural' })
  categoria: 'historico' | 'cultural' | 'recreativo' | 'comercial' | 'transporte';

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  calificacion_promedio: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imagen_url: string;

  @Column({ type: 'int', nullable: true })
  id_usuario_creador: number;

  @Column({ type: 'enum', enum: ['activo', 'inactivo', 'pendiente_aprobacion'], default: 'pendiente_aprobacion' })
  estado: 'activo' | 'inactivo' | 'pendiente_aprobacion';

  @CreateDateColumn({ type: 'timestamp' })
  fecha_creacion: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  fecha_actualizacion: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_usuario_creador' })
  creator: User;
}
