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
@Controller('system-notifications')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class SystemNotificationController {
  constructor(private readonly systemNotificationService: SystemNotificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva notificación del sistema' })
  @ApiResponse({ status: 201, description: 'Notificación creada exitosamente' })
  create(@Body() createNotificationDto: CreateSystemNotificationDto) {
    return this.systemNotificationService.create(createNotificationDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todas las notificaciones con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones' })
  findAll(@Query() queryDto: QuerySystemNotificationDto, @GetUser() user: User) {
    return this.systemNotificationService.findAll(queryDto, user.id_usuario);
  }

  @Get('my-notifications')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener notificaciones del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Notificaciones del usuario' })
  getMyNotifications(@Query() queryDto: QuerySystemNotificationDto, @GetUser() user: User) {
    return this.systemNotificationService.getUserNotifications(user.id_usuario, queryDto);
  }

  @Get('unread-count')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener cantidad de notificaciones no leídas del usuario' })
  @ApiResponse({ status: 200, description: 'Cantidad de notificaciones no leídas' })
  getUnreadCount(@GetUser() user: User) {
    return this.systemNotificationService.getUnreadCount(user.id_usuario);
  }

  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de notificaciones' })
  @ApiResponse({ status: 200, description: 'Estadísticas de notificaciones' })
  getStatistics() {
    return this.systemNotificationService.getNotificationStatistics();
  }

  @Get('global')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener notificaciones globales' })
  @ApiResponse({ status: 200, description: 'Notificaciones globales' })
  getGlobalNotifications(@Query() queryDto: QuerySystemNotificationDto) {
    return this.systemNotificationService.getGlobalNotifications(queryDto);
  }

  @Get('recent')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener notificaciones recientes del usuario' })
  @ApiResponse({ status: 200, description: 'Notificaciones recientes' })
  getRecentNotifications(@GetUser() user: User, @Query('limit', ParseIntPipe) limit?: number) {
    return this.systemNotificationService.getRecentNotifications(user.id_usuario, limit);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener notificación por ID' })
  @ApiResponse({ status: 200, description: 'Notificación encontrada' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.systemNotificationService.findOne(id, user.id_usuario);
  }

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

  @Patch('mark-all-read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar todas las notificaciones del usuario como leídas' })
  @ApiResponse({ status: 200, description: 'Todas las notificaciones marcadas como leídas' })
  markAllRead(@GetUser() user: User) {
    return this.systemNotificationService.markAllAsRead(user.id_usuario);
  }

  @Patch('bulk-mark-read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar múltiples notificaciones como leídas/no leídas' })
  @ApiResponse({ status: 200, description: 'Notificaciones actualizadas exitosamente' })
  bulkMarkRead(@Body() bulkMarkReadDto: BulkMarkReadDto, @GetUser() user: User) {
    return this.systemNotificationService.bulkMarkAsRead(bulkMarkReadDto, user.id_usuario);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
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

  @Delete('bulk')
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar múltiples notificaciones' })
  @ApiResponse({ status: 204, description: 'Notificaciones eliminadas exitosamente' })
  bulkDelete(@Body() bulkDeleteDto: BulkDeleteDto) {
    return this.systemNotificationService.bulkDelete(bulkDeleteDto.notification_ids);
  }

  @Delete('cleanup-expired')
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Limpiar notificaciones expiradas' })
  @ApiResponse({ status: 204, description: 'Notificaciones expiradas eliminadas' })
  cleanupExpired() {
    return this.systemNotificationService.cleanupExpiredNotifications();
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar notificación' })
  @ApiResponse({ status: 204, description: 'Notificación eliminada exitosamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.systemNotificationService.remove(id);
  }

  // Endpoints para crear notificaciones automáticas
  @Post('auto/route-created')
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador', 'Editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear notificación automática para nueva ruta' })
  @ApiResponse({ status: 201, description: 'Notificación automática creada' })
  createRouteNotification(@Body() routeData: { routeId: number; routeName: string }) {
    return this.systemNotificationService.createRouteCreatedNotification(routeData.routeId, routeData.routeName);
  }

  @Post('auto/station-maintenance')
  @UseGuards(RolesGuard)
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