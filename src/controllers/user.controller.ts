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
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../modules/user/dto/create-user.dto';
import { UpdateUserDto } from '../modules/user/dto/update-user.dto';
import { ChangePasswordDto } from '../modules/user/dto/change-password.dto';

@Controller('users') // 🔗 RUTA BASE: '/users' - TODAS LAS RUTAS AGRUPADAS BAJO ESTA BASE
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ========================================
  // 📝 OPERACIONES CRUD BÁSICAS - GRUPO 1: RUTAS ESTÁNDAR
  // ⚠️ SEPARACIÓN: Sin guards - ACCESO PÚBLICO TOTAL
  // ========================================

  /**
   * 🆕 CREAR - POST /users
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Sin autenticación - acceso público para registro
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * 📋 LEER TODOS - GET /users
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Sin autenticación - acceso público
   */
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // ========================================
  // 🔍 RUTAS ESPECIALIZADAS - GRUPO 2: CONSULTAS ESPECÍFICAS
  // ⚠️ SEPARACIÓN CRÍTICA: Esta ruta VA ANTES de ':id' para evitar conflictos
  // ========================================

  /**
   * ✅ USUARIOS ACTIVOS - GET /users/active
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Ruta específica que debe ir antes de ':id'
   */
  @Get('active')
  findActiveUsers() {
    return this.userService.findActiveUsers();
  }

  // ========================================
  // 🔍 RUTAS CON PARÁMETROS ID - GRUPO 3: OPERACIONES POR ID
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN DESPUÉS de rutas específicas
  // ========================================

  /**
   * 🔍 LEER UNO - GET /users/:id
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Colocada después de rutas específicas para evitar conflictos
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  /**
   * 👤 PERFIL DE USUARIO - GET /users/:id/profile
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Extiende la ruta ':id' con funcionalidad específica de perfil
   */
  @Get(':id/profile')
  getUserProfile(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserProfile(id);
  }

  // ========================================
  // ✏️ OPERACIONES DE ACTUALIZACIÓN - GRUPO 4: RUTAS PATCH
  // ========================================

  /**
   * ✏️ ACTUALIZAR USUARIO - PATCH /users/:id
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Sin autenticación - acceso público
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.update(id, updateUserDto);
  }

  /**
   * 👤 ACTUALIZAR PERFIL - PATCH /users/:id/profile
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Operación específica para actualizar perfil de usuario
   */
  @Patch(':id/profile')
  updateUserProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() profileData: any
  ) {
    return this.userService.updateUserProfile(id, profileData);
  }

  /**
   * 🔐 CAMBIAR CONTRASEÑA - PATCH /users/:id/change-password
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Operación específica para cambio de contraseña
   */
  @Patch(':id/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.userService.changePassword(id, changePasswordDto);
  }

  /**
   * 🕒 ACTUALIZAR ÚLTIMO ACCESO - PATCH /users/:id/update-last-access
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Operación específica para tracking de acceso
   */
  @Patch(':id/update-last-access')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateLastAccess(@Param('id', ParseIntPipe) id: number) {
    return this.userService.updateLastAccess(id);
  }

  // ========================================
  // 🗑️ OPERACIONES DE ELIMINACIÓN - GRUPO 5: RUTAS DELETE
  // ========================================

  /**
   * 🗑️ ELIMINAR USUARIO - DELETE /users/:id
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Sin autenticación - acceso público
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
