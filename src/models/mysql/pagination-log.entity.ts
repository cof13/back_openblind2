import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('paginacion_logs')
@Index(['id_usuario', 'entidad_tipo'])
@Index(['fecha_solicitud'])
export class PaginationLog {
  @PrimaryGeneratedColumn()
  id_log: number;

  @Column({ type: 'int' })
  id_usuario: number;

  @Column({ type: 'varchar', length: 50, comment: 'Tipo de entidad paginada' })
  entidad_tipo: string;

  @Column({ type: 'int', comment: 'Página solicitada' })
  pagina_solicitada: number;

  @Column({ type: 'int', comment: 'Elementos por página' })
  elementos_por_pagina: number;

  @Column({ type: 'int', comment: 'Total de elementos' })
  total_elementos: number;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: 'Filtros aplicados en JSON' })
  filtros_aplicados: string;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_solicitud: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  user: User;
}
