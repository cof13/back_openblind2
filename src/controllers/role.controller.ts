// src/modules/role/role.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../modules/role/dto/create-role.dto';
import { UpdateRoleDto } from '../modules/role/dto/update-role.dto';

@Controller('roles') // 🔗 RUTA BASE: '/roles' - TODAS LAS RUTAS AGRUPADAS BAJO ESTA BASE
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // ========================================
  // 📝 OPERACIONES CRUD BÁSICAS - GRUPO 1: RUTAS ESTÁNDAR
  // ========================================

  /**
   * 🆕 CREAR - POST /roles
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Sin guards - acceso público
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  /**
   * 📋 LEER TODOS - GET /roles
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Sin guards - acceso público
   */
  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  // ========================================
  // 🔍 RUTAS ESPECIALIZADAS - GRUPO 2: CONSULTAS ESPECÍFICAS
  // ⚠️ SEPARACIÓN CRÍTICA: Esta ruta VA ANTES de ':id' para evitar conflictos
  // ========================================

  /**
   * ✅ ROLES ACTIVOS - GET /roles/active
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Ruta específica que debe ir antes de ':id'
   */
  @Get('active')
  findActiveRoles() {
    return this.roleService.findActiveRoles();
  }

  // ========================================
  // 🔍 RUTAS CON PARÁMETROS - GRUPO 3: OPERACIONES POR ID
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN DESPUÉS de rutas específicas
  // ========================================

  /**
   * 🔍 LEER UNO - GET /roles/:id
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Colocada después de rutas específicas para evitar conflictos
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }

  /**
   * 👥 USUARIOS POR ROL - GET /roles/:id/users
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Extiende la ruta ':id' con funcionalidad adicional
   */
  @Get(':id/users')
  getUsersByRole(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.getUsersByRole(id);
  }

  /**
   * ✏️ ACTUALIZAR - PATCH /roles/:id
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Sin guards adicionales - acceso público
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateRoleDto: UpdateRoleDto
  ) {
    return this.roleService.update(id, updateRoleDto);
  }

  /**
   * 🗑️ ELIMINAR - DELETE /roles/:id
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Sin guards adicionales - acceso público
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.remove(id);
  }
}
