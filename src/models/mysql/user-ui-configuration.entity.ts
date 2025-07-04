import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('usuarios_configuraciones_ui')
@Index(['id_usuario', 'clave_configuracion'], { unique: true })
export class UserUIConfiguration {
  @PrimaryGeneratedColumn()
  id_configuracion: number;

  @Column({ type: 'int' })
  id_usuario: number;

  @Column({ type: 'varchar', length: 100, comment: 'Clave de configuración' })
  clave_configuracion: string;

  @Column({ type: 'text', comment: 'Valor de la configuración' })
  valor_configuracion: string;

  @Column({ type: 'varchar', length: 50, comment: 'Sección de la UI' })
  seccion_ui: string;

  @UpdateDateColumn({ type: 'timestamp' })
  fecha_actualizacion: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  user: User;
}
