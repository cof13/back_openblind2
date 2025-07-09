// src/modules/role/role.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from '../services/role.service';
import { RoleController } from '../controllers/role.controller';
import { Role } from '../models/mysql/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService], // Exportar para usar en otros módulos
})
export class RoleModule {}