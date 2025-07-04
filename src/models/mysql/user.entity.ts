import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from './role.entity';
import { Route } from './route.entity';
import { PersonalizedMessage } from './personalized-message.entity';
import { UserSession } from './user-session.entity';
import { UserPhone } from './user-phone.entity';
import { UserActivity } from './user-activity.entity';

@Entity('usuarios')

@Index(['id_rol'])
export class User {
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @Column({ type: 'varchar', length: 100, comment: 'Nombres del usuario' })
  nombres: string;

  @Column({ type: 'varchar', length: 100, comment: 'Apellidos del usuario' })
  apellidos: string;

  @Column({ type: 'varchar', length: 150, unique: true, comment: 'Email único' })
  email: string;

  @Column({ type: 'varchar', length: 255, comment: 'Contraseña hasheada' })
  @Exclude()
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: 'Teléfono principal' })
  telefono: string;

  @Column({ type: 'date', nullable: true, comment: 'Fecha de nacimiento' })
  fecha_nacimiento: Date;

  @Column({ type: 'int', comment: 'ID del rol asignado' })
  id_rol: number;

  @Column({ type: 'enum', enum: ['activo', 'inactivo', 'suspendido'], default: 'activo' })
  estado: 'activo' | 'inactivo' | 'suspendido';

  @CreateDateColumn({ type: 'timestamp' })
  fecha_registro: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  fecha_actualizacion: Date;

  @Column({ type: 'timestamp', nullable: true, comment: 'Último acceso al sistema' })
  ultimo_acceso: Date;

  @Column({ type: 'varchar', length: 24, nullable: true, comment: 'ID perfil MongoDB' })
  profile_mongo_id: string;

  @ManyToOne(() => Role, role => role.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_rol' })
  role: Role;

  @OneToMany(() => Route, route => route.creator)
  created_routes: Route[];

  @OneToMany(() => PersonalizedMessage, message => message.creator)
  created_messages: PersonalizedMessage[];

  @OneToMany(() => UserSession, session => session.user)
  sessions: UserSession[];

  @OneToMany(() => UserPhone, phone => phone.user)
  phones: UserPhone[];

  @OneToMany(() => UserActivity, activity => activity.user)
  activities: UserActivity[];

  get fullName(): string {
    return `${this.nombres} ${this.apellidos}`;
  }

  get isActive(): boolean {
    return this.estado === 'activo';
  }
}
