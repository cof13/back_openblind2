import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SystemNotificationService } from '../services/system-notification.service';
import { CreateSystemNotificationDto } from '../modules/system-notification/dto/create-system-notification.dto';
import { UpdateSystemNotificationDto } from '../modules/system-notification/dto/update-system-notification.dto';
import { QuerySystemNotificationDto } from '../modules/system-notification/dto/query-system-notification.dto';
import { MarkReadDto } from '../modules/system-notification/dto/mark-read.dto';
import { BulkMarkReadDto, BulkDeleteDto } from '../modules/system-notification/dto/bulk-operation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../models/mysql/user.entity';

@ApiTags('Notificaciones del Sistema')
@Controller('system-notifications') // 🔗 RUTA BASE: '/system-notifications' - TODAS LAS RUTAS AGRUPADAS BAJO ESTA BASE
@UseGuards(JwtAuthGuard) // 🔐 AUTENTICACIÓN: Aplica a todas las rutas - AGRUPACIÓN GLOBAL DE SEGURIDAD
@UseInterceptors(ClassSerializerInterceptor)
export class SystemNotificationController {
  constructor(private readonly systemNotificationService: SystemNotificationService) {}

  // ========================================
  // 📝 OPERACIONES CRUD BÁSICAS - GRUPO 1: RUTAS ESTÁNDAR
  // ========================================

  /**
   * 🆕 CREAR - POST /system-notifications
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Tiene su propio guard adicional para roles administrativos
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard adicional específico para administradores
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva notificación del sistema' })
  @ApiResponse({ status: 201, description: 'Notificación creada exitosamente' })
  create(@Body() createNotificationDto: CreateSystemNotificationDto) {
    return this.systemNotificationService.create(createNotificationDto);
  }

  /**
   * 📋 LEER TODOS - GET /system-notifications
   * AGRUPADA: Solo usa la autenticación JWT del controlador
   * SEPARADA: Sin guards adicionales - acceso para usuario autenticado
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todas las notificaciones con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones' })
  findAll(@Query() queryDto: QuerySystemNotificationDto, @GetUser() user: User) {
    return this.systemNotificationService.findAll(queryDto, user.id_usuario);
  }

  // ========================================
  // 🔍 RUTAS ESPECIALIZADAS - GRUPO 2: CONSULTAS ESPECÍFICAS
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN ANTES de ':id' para evitar conflictos
  // ========================================

  /**
   * 👤 MIS NOTIFICACIONES - GET /system-notifications/my-notifications
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Ruta específica para el usuario autenticado
   */
  @Get('my-notifications')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener notificaciones del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Notificaciones del usuario' })
  getMyNotifications(@Query() queryDto: QuerySystemNotificationDto, @GetUser() user: User) {
    return this.systemNotificationService.getUserNotifications(user.id_usuario, queryDto);
  }

  /**
   * 🔢 CONTADOR NO LEÍDAS - GET /system-notifications/unread-count
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Ruta específica para contar notificaciones no leídas
   */
  @Get('unread-count')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener cantidad de notificaciones no leídas del usuario' })
  @ApiResponse({ status: 200, description: 'Cantidad de notificaciones no leídas' })
  getUnreadCount(@GetUser() user: User) {
    return this.systemNotificationService.getUnreadCount(user.id_usuario);
  }

  /**
   * 📊 ESTADÍSTICAS - GET /system-notifications/statistics
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional para roles administrativos
   */
  @Get('statistics')
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para administradores
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de notificaciones' })
  @ApiResponse({ status: 200, description: 'Estadísticas de notificaciones' })
  getStatistics() {
    return this.systemNotificationService.getNotificationStatistics();
  }

  /**
   * 🌐 GLOBALES - GET /system-notifications/global
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Ruta específica para notificaciones globales
   */
  @Get('global')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener notificaciones globales' })
  @ApiResponse({ status: 200, description: 'Notificaciones globales' })
  getGlobalNotifications(@Query() queryDto: QuerySystemNotificationDto) {
    return this.systemNotificationService.getGlobalNotifications(queryDto);
  }

  /**
   * 🕒 RECIENTES - GET /system-notifications/recent
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Ruta específica para notificaciones recientes
   */
  @Get('recent')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener notificaciones recientes del usuario' })
  @ApiResponse({ status: 200, description: 'Notificaciones recientes' })
  getRecentNotifications(@GetUser() user: User, @Query('limit', ParseIntPipe) limit?: number) {
    return this.systemNotificationService.getRecentNotifications(user.id_usuario, limit);
  }

  // ========================================
  // 🔍 RUTAS CON PARÁMETROS ID - GRUPO 3: OPERACIONES POR ID
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN DESPUÉS de todas las rutas específicas
  // ========================================

  /**
   * 🔍 LEER UNO - GET /system-notifications/:id
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Colocada después de rutas específicas para evitar conflictos
   */
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener notificación por ID' })
  @ApiResponse({ status: 200, description: 'Notificación encontrada' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.systemNotificationService.findOne(id, user.id_usuario);
  }

  // ========================================
  // ✏️ OPERACIONES DE ACTUALIZACIÓN - GRUPO 4: RUTAS PATCH
  // ========================================

  /**
   * ✅ MARCAR COMO LEÍDA - PATCH /system-notifications/:id/mark-read
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Operación específica para marcar como leída
   */
  @Patch(':id/mark-read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar notificación como leída/no leída' })
  @ApiResponse({ status: 200, description: 'Estado de lectura actualizado' })
  markRead(
    @Param('id', ParseIntPipe) id: number,
    @Body() markReadDto: MarkReadDto,
    @GetUser() user: User
  ) {
    return this.systemNotificationService.markAsRead(id, markReadDto.leida, user.id_usuario);
  }

  /**
   * ✅ MARCAR TODAS - PATCH /system-notifications/mark-all-read
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Operación masiva para marcar todas como leídas
   */
  @Patch('mark-all-read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar todas las notificaciones del usuario como leídas' })
  @ApiResponse({ status: 200, description: 'Todas las notificaciones marcadas como leídas' })
  markAllRead(@GetUser() user: User) {
    return this.systemNotificationService.markAllAsRead(user.id_usuario);
  }

  /**
   * ✅ MARCAR MÚLTIPLES - PATCH /system-notifications/bulk-mark-read
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Operación masiva para marcar múltiples como leídas
   */
  @Patch('bulk-mark-read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar múltiples notificaciones como leídas/no leídas' })
  @ApiResponse({ status: 200, description: 'Notificaciones actualizadas exitosamente' })
  bulkMarkRead(@Body() bulkMarkReadDto: BulkMarkReadDto, @GetUser() user: User) {
    return this.systemNotificationService.bulkMarkAsRead(bulkMarkReadDto, user.id_usuario);
  }

  /**
   * ✏️ ACTUALIZAR - PATCH /system-notifications/:id
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional específico para roles administrativos
   */
  @Patch(':id')
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para administradores
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar notificación (solo administradores)' })
  @ApiResponse({ status: 200, description: 'Notificación actualizada exitosamente' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateNotificationDto: UpdateSystemNotificationDto
  ) {
    return this.systemNotificationService.update(id, updateNotificationDto);
  }

  // ========================================
  // 🗑️ OPERACIONES DE ELIMINACIÓN - GRUPO 5: RUTAS DELETE
  // ========================================

  /**
   * 🗑️ ELIMINAR MÚLTIPLES - DELETE /system-notifications/bulk
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional específico para roles administrativos
   */
  @Delete('bulk')
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para administradores
  @Roles('Super Administrador', 'Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar múltiples notificaciones' })
  @ApiResponse({ status: 204, description: 'Notificaciones eliminadas exitosamente' })
  bulkDelete(@Body() bulkDeleteDto: BulkDeleteDto) {
    return this.systemNotificationService.bulkDelete(bulkDeleteDto.notification_ids);
  }

  /**
   * 🧹 LIMPIAR EXPIRADAS - DELETE /system-notifications/cleanup-expired
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional específico para roles administrativos
   */
  @Delete('cleanup-expired')
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para administradores
  @Roles('Super Administrador', 'Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Limpiar notificaciones expiradas' })
  @ApiResponse({ status: 204, description: 'Notificaciones expiradas eliminadas' })
  cleanupExpired() {
    return this.systemNotificationService.cleanupExpiredNotifications();
  }

  /**
   * 🗑️ ELIMINAR UNO - DELETE /system-notifications/:id
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional específico para roles administrativos
   */
  @Delete(':id')
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para administradores
  @Roles('Super Administrador', 'Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar notificación' })
  @ApiResponse({ status: 204, description: 'Notificación eliminada exitosamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.systemNotificationService.remove(id);
  }

  // ========================================
  // 🤖 ENDPOINTS AUTOMÁTICOS - GRUPO 6: NOTIFICACIONES AUTOMÁTICAS
  // ⚠️ SEPARACIÓN ESPECIAL: Endpoints para crear notificaciones automáticas
  // ========================================

  /**
   * 🛣️ NOTIFICACIÓN RUTA CREADA - POST /system-notifications/auto/route-created
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional para roles de edición + funcionalidad automática
   */
  @Post('auto/route-created')
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para editores
  @Roles('Super Administrador', 'Administrador', 'Editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear notificación automática para nueva ruta' })
  @ApiResponse({ status: 201, description: 'Notificación automática creada' })
  createRouteNotification(@Body() routeData: { routeId: number; routeName: string }) {
    return this.systemNotificationService.createRouteCreatedNotification(routeData.routeId, routeData.routeName);
  }

  /**
   * 🔧 NOTIFICACIÓN MANTENIMIENTO - POST /system-notifications/auto/station-maintenance
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional para roles de edición + funcionalidad automática
   */
  @Post('auto/station-maintenance')
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para editores
  @Roles('Super Administrador', 'Administrador', 'Editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear notificación automática para mantenimiento de estación' })
  @ApiResponse({ status: 201, description: 'Notificación de mantenimiento creada' })
  createMaintenanceNotification(@Body() stationData: { stationId: number; stationName: string; maintenanceDate: string }) {
    return this.systemNotificationService.createStationMaintenanceNotification(
      stationData.stationId, 
      stationData.stationName, 
      new Date(stationData.maintenanceDate)
    );
  }
}
