import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('sesiones_usuario')
@Index(['id_usuario'])
@Index(['estado'])
export class UserSession {
  @PrimaryGeneratedColumn()
  id_sesion: number;

  @Column({ type: 'int' })
  id_usuario: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  token_sesion: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_inicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_expiracion: Date;

  @Column({ type: 'enum', enum: ['activa', 'expirada', 'cerrada'], default: 'activa' })
  estado: 'activa' | 'expirada' | 'cerrada';

  @Column({ type: 'timestamp', nullable: true })
  ultima_actividad: Date;

  @ManyToOne(() => User, user => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  user: User;
}
