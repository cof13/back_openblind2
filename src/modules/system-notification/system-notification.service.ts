// src/modules/system-notification/system-notification.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In, IsNull, MoreThan, Or } from 'typeorm';
import { CreateSystemNotificationDto } from './dto/create-system-notification.dto';
import { UpdateSystemNotificationDto } from './dto/update-system-notification.dto';
import { QuerySystemNotificationDto } from './dto/query-system-notification.dto';
import { BulkMarkReadDto } from './dto/bulk-operation.dto';
import { SystemNotification } from '../../models/mysql/system-notification.entity';
import { User } from '../../models/mysql/user.entity';

@Injectable()
export class SystemNotificationService {
  private readonly logger = new Logger(SystemNotificationService.name);

  constructor(
    @InjectRepository(SystemNotification)
    private readonly notificationRepository: Repository<SystemNotification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createNotificationDto: CreateSystemNotificationDto): Promise<SystemNotification> {
    // Verificar que el usuario destinatario existe si se proporciona
    if (createNotificationDto.id_usuario_destinatario) {
      const user = await this.userRepository.findOne({
        where: { id_usuario: createNotificationDto.id_usuario_destinatario, estado: 'activo' }
      });

      if (!user) {
        throw new BadRequestException(`El usuario con ID ${createNotificationDto.id_usuario_destinatario} no existe o no está activo`);
      }
    }

    // Crear notificación
    const notificationData = {
      id_usuario_destinatario: createNotificationDto.id_usuario_destinatario,
      titulo_notificacion: createNotificationDto.titulo_notificacion,
      mensaje_notificacion: createNotificationDto.mensaje_notificacion,
      tipo_notificacion: createNotificationDto.tipo_notificacion || 'info' as const,
      entidad_relacionada: createNotificationDto.entidad_relacionada,
      entidad_id: createNotificationDto.entidad_id,
      leida: createNotificationDto.leida || false,
      fecha_expiracion: createNotificationDto.fecha_expiracion ? new Date(createNotificationDto.fecha_expiracion) : undefined,
    };

    const notification = this.notificationRepository.create(notificationData);
    const savedNotification = await this.notificationRepository.save(notification);

    this.logger.log(`✅ Notificación creada: ${savedNotification.id_notificacion} - ${savedNotification.titulo_notificacion}`);
    return this.findOne(savedNotification.id_notificacion);
  }

  async findAll(queryDto?: QuerySystemNotificationDto, requestingUserId?: number) {
    const page = queryDto?.page || 1;
    const limit = queryDto?.limit || 10;
    const offset = (page - 1) * limit;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user');

    // Filtros de acceso: solo administradores pueden ver todas las notificaciones
    const requestingUser = await this.userRepository.findOne({
      where: { id_usuario: requestingUserId },
      relations: ['role']
    });

    const isAdmin = requestingUser && ['Super Administrador', 'Administrador'].includes(requestingUser.role.nombre_rol);

    if (!isAdmin) {
      // Usuarios normales solo ven sus notificaciones y las globales
      queryBuilder.andWhere(
        '(notification.id_usuario_destinatario = :userId OR notification.id_usuario_destinatario IS NULL)',
        { userId: requestingUserId }
      );
    }

    // Aplicar filtros
    if (queryDto?.id_usuario_destinatario !== undefined) {
      if (queryDto.id_usuario_destinatario === null || queryDto.global) {
        queryBuilder.andWhere('notification.id_usuario_destinatario IS NULL');
      } else {
        queryBuilder.andWhere('notification.id_usuario_destinatario = :id_usuario_destinatario', {
          id_usuario_destinatario: queryDto.id_usuario_destinatario
        });
      }
    }

    if (queryDto?.tipo_notificacion) {
      queryBuilder.andWhere('notification.tipo_notificacion = :tipo_notificacion', {
        tipo_notificacion: queryDto.tipo_notificacion
      });
    }

    if (queryDto?.leida !== undefined) {
      queryBuilder.andWhere('notification.leida = :leida', { leida: queryDto.leida });
    }

    if (queryDto?.entidad_relacionada) {
      queryBuilder.andWhere('notification.entidad_relacionada = :entidad_relacionada', {
        entidad_relacionada: queryDto.entidad_relacionada
      });
    }

    if (queryDto?.entidad_id) {
      queryBuilder.andWhere('notification.entidad_id = :entidad_id', {
        entidad_id: queryDto.entidad_id
      });
    }

    if (queryDto?.search) {
      queryBuilder.andWhere(
        '(notification.titulo_notificacion LIKE :search OR notification.mensaje_notificacion LIKE :search)',
        { search: `%${queryDto.search}%` }
      );
    }

    // Filtrar notificaciones expiradas a menos que se solicite explícitamente
    if (!queryDto?.include_expired) {
      queryBuilder.andWhere(
        '(notification.fecha_expiracion IS NULL OR notification.fecha_expiracion > :now)',
        { now: new Date() }
      );
    }

    // Aplicar paginación y ordenamiento
    queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('notification.fecha_creacion', 'DESC');

    const [notifications, total] = await queryBuilder.getManyAndCount();

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1
      }
    };
  }

  async findOne(id: number, requestingUserId?: number): Promise<SystemNotification> {
    const notification = await this.notificationRepository.findOne({
      where: { id_notificacion: id },
      relations: ['user']
    });

    if (!notification) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }

    // Verificar acceso
    if (requestingUserId) {
      const requestingUser = await this.userRepository.findOne({
        where: { id_usuario: requestingUserId },
        relations: ['role']
      });

      const isAdmin = requestingUser && ['Super Administrador', 'Administrador'].includes(requestingUser.role.nombre_rol);
      const isOwner = notification.id_usuario_destinatario === requestingUserId;
      const isGlobal = notification.id_usuario_destinatario === null;

      if (!isAdmin && !isOwner && !isGlobal) {
        throw new ForbiddenException('No tienes permisos para ver esta notificación');
      }
    }

    return notification;
  }

  async update(id: number, updateNotificationDto: UpdateSystemNotificationDto): Promise<SystemNotification> {
    const notification = await this.findOne(id);

    await this.notificationRepository.update(id, updateNotificationDto);

    this.logger.log(`✅ Notificación actualizada: ${id}`);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);

    await this.notificationRepository.delete(id);
    this.logger.log(`✅ Notificación eliminada: ${id} - ${notification.titulo_notificacion}`);
  }

  async getUserNotifications(userId: number, queryDto?: QuerySystemNotificationDto) {
    const page = queryDto?.page || 1;
    const limit = queryDto?.limit || 10;
    const offset = (page - 1) * limit;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where(
        '(notification.id_usuario_destinatario = :userId OR notification.id_usuario_destinatario IS NULL)',
        { userId }
      );

    // Aplicar filtros específicos del usuario
    if (queryDto?.tipo_notificacion) {
      queryBuilder.andWhere('notification.tipo_notificacion = :tipo_notificacion', {
        tipo_notificacion: queryDto.tipo_notificacion
      });
    }

    if (queryDto?.leida !== undefined) {
      queryBuilder.andWhere('notification.leida = :leida', { leida: queryDto.leida });
    }

    // Filtrar notificaciones expiradas
    if (!queryDto?.include_expired) {
      queryBuilder.andWhere(
        '(notification.fecha_expiracion IS NULL OR notification.fecha_expiracion > :now)',
        { now: new Date() }
      );
    }

    queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('notification.leida', 'ASC') // No leídas primero
      .addOrderBy('notification.fecha_creacion', 'DESC');

    const [notifications, total] = await queryBuilder.getManyAndCount();

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1
      }
    };
  }

  async getUnreadCount(userId: number) {
    const count = await this.notificationRepository
      .createQueryBuilder('notification')
      .where(
        '(notification.id_usuario_destinatario = :userId OR notification.id_usuario_destinatario IS NULL)',
        { userId }
      )
      .andWhere('notification.leida = false')
      .andWhere(
        '(notification.fecha_expiracion IS NULL OR notification.fecha_expiracion > :now)',
        { now: new Date() }
      )
      .getCount();

    return { unread_count: count };
  }

  async markAsRead(id: number, leida: boolean, userId: number): Promise<SystemNotification> {
    const notification = await this.findOne(id, userId);

    // Solo se puede marcar como leída si es del usuario o es global
    if (notification.id_usuario_destinatario !== userId && notification.id_usuario_destinatario !== null) {
      throw new ForbiddenException('No puedes modificar esta notificación');
    }

    const updateData: any = { leida };
    if (leida) {
      updateData.fecha_lectura = new Date();
    } else {
      updateData.fecha_lectura = null;
    }

    await this.notificationRepository.update(id, updateData);

    this.logger.log(`✅ Notificación marcada como ${leida ? 'leída' : 'no leída'}: ${id}`);
    return this.findOne(id, userId);
  }

  async markAllAsRead(userId: number) {
    const result = await this.notificationRepository.update(
      [
        { id_usuario_destinatario: userId, leida: false },
        { id_usuario_destinatario: IsNull(), leida: false } // Usar IsNull() para globales
      ],
      {
        leida: true,
        fecha_lectura: new Date()
      }
    );

    this.logger.log(`✅ ${result.affected} notificaciones marcadas como leídas para usuario ${userId}`);
    return { marked_as_read: result.affected };
  }

  async bulkMarkAsRead(bulkMarkReadDto: BulkMarkReadDto, userId: number) {
    // Verificar que todas las notificaciones pertenecen al usuario o son globales
    const notifications = await this.notificationRepository.find({
      where: { id_notificacion: In(bulkMarkReadDto.notification_ids) }
    });

    const validNotifications = notifications.filter(notification =>
      notification.id_usuario_destinatario === userId || notification.id_usuario_destinatario === null
    );

    if (validNotifications.length !== bulkMarkReadDto.notification_ids.length) {
      throw new ForbiddenException('Algunas notificaciones no te pertenecen');
    }

    const updateData: any = { leida: bulkMarkReadDto.leida };
    if (bulkMarkReadDto.leida) {
      updateData.fecha_lectura = new Date();
    } else {
      updateData.fecha_lectura = null;
    }

    const result = await this.notificationRepository.update(
      { id_notificacion: In(bulkMarkReadDto.notification_ids) },
      updateData
    );

    this.logger.log(`✅ ${result.affected} notificaciones actualizadas en lote`);
    return { updated: result.affected };
  }

  async bulkDelete(notificationIds: number[]) {
    const result = await this.notificationRepository.delete(notificationIds);

    this.logger.log(`✅ ${result.affected} notificaciones eliminadas en lote`);
    return { deleted: result.affected };
  }

  async getGlobalNotifications(queryDto?: QuerySystemNotificationDto) {
    const page = queryDto?.page || 1;
    const limit = queryDto?.limit || 10;
    const offset = (page - 1) * limit;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.id_usuario_destinatario IS NULL');

    // Aplicar filtros
    if (queryDto?.tipo_notificacion) {
      queryBuilder.andWhere('notification.tipo_notificacion = :tipo_notificacion', {
        tipo_notificacion: queryDto.tipo_notificacion
      });
    }

    // Filtrar notificaciones expiradas
    if (!queryDto?.include_expired) {
      queryBuilder.andWhere(
        '(notification.fecha_expiracion IS NULL OR notification.fecha_expiracion > :now)',
        { now: new Date() }
      );
    }

    queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('notification.fecha_creacion', 'DESC');

    const [notifications, total] = await queryBuilder.getManyAndCount();

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1
      }
    };
  }

  async getRecentNotifications(userId: number, limit: number = 5) {
    const notifications = await this.notificationRepository.find({
      where: [
        { id_usuario_destinatario: userId },
        { id_usuario_destinatario: IsNull() } // Usar IsNull() para globales
      ],
      order: { fecha_creacion: 'DESC' },
      take: limit
    });

    return notifications;
  }

  async getNotificationStatistics() {
    const total = await this.notificationRepository.count();
    const unread = await this.notificationRepository.count({ where: { leida: false } });
    const global = await this.notificationRepository.count({ where: { id_usuario_destinatario: IsNull() } });
    const expired = await this.notificationRepository.count({
      where: { fecha_expiracion: LessThan(new Date()) }
    });

    const byType = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.tipo_notificacion', 'tipo')
      .addSelect('COUNT(*)', 'count')
      .groupBy('notification.tipo_notificacion')
      .getRawMany();

    const byEntity = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.entidad_relacionada', 'entidad')
      .addSelect('COUNT(*)', 'count')
      .where('notification.entidad_relacionada IS NOT NULL')
      .groupBy('notification.entidad_relacionada')
      .getRawMany();

    return {
      total,
      unread,
      global,
      expired,
      personal: total - global,
      by_type: byType,
      by_entity: byEntity
    };
  }

  async cleanupExpiredNotifications() {
    const result = await this.notificationRepository.delete({
      fecha_expiracion: LessThan(new Date())
    });

    this.logger.log(`✅ ${result.affected} notificaciones expiradas eliminadas`);
    return { deleted: result.affected };
  }

  // Métodos para crear notificaciones automáticas
  async createRouteCreatedNotification(routeId: number, routeName: string) {
    const notification = await this.create({
      titulo_notificacion: 'Nueva ruta disponible',
      mensaje_notificacion: `Se ha agregado una nueva ruta de transporte: ${routeName}. ¡Explórala ahora!`,
      tipo_notificacion: 'success',
      entidad_relacionada: 'Route',
      entidad_id: routeId,
      fecha_expiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
    });

    this.logger.log(`✅ Notificación automática creada para nueva ruta: ${routeName}`);
    return notification;
  }

  async createStationMaintenanceNotification(stationId: number, stationName: string, maintenanceDate: Date) {
    const notification = await this.create({
      titulo_notificacion: 'Mantenimiento programado',
      mensaje_notificacion: `La estación ${stationName} estará en mantenimiento el ${maintenanceDate.toLocaleDateString('es-EC')}. Planifica tu viaje con anticipación.`,
      tipo_notificacion: 'warning',
      entidad_relacionada: 'Station',
      entidad_id: stationId,
      fecha_expiracion: new Date(maintenanceDate.getTime() + 24 * 60 * 60 * 1000).toISOString() // 1 día después del mantenimiento
    });

    this.logger.log(`✅ Notificación automática creada para mantenimiento de estación: ${stationName}`);
    return notification;
  }

  async createUserWelcomeNotification(userId: number, userName: string) {
    const notification = await this.create({
      id_usuario_destinatario: userId,
      titulo_notificacion: '¡Bienvenido a OpenBlind!',
      mensaje_notificacion: `Hola ${userName}, bienvenido a OpenBlind. Explora las rutas de transporte accesible y descubre nuevos lugares.`,
      tipo_notificacion: 'info',
      entidad_relacionada: 'User',
      entidad_id: userId,
      fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
    });

    this.logger.log(`✅ Notificación de bienvenida creada para usuario: ${userName}`);
    return notification;
  }

  async createSystemMaintenanceNotification(maintenanceDate: Date, duration: string) {
    const notification = await this.create({
      titulo_notificacion: 'Mantenimiento del sistema',
      mensaje_notificacion: `El sistema estará en mantenimiento el ${maintenanceDate.toLocaleDateString('es-EC')} durante ${duration}. Disculpa las molestias.`,
      tipo_notificacion: 'warning',
      entidad_relacionada: 'System',
      fecha_expiracion: new Date(maintenanceDate.getTime() + 24 * 60 * 60 * 1000).toISOString()
    });

    this.logger.log(`✅ Notificación de mantenimiento del sistema creada`);
    return notification;
  }

  async createServiceRatingReminderNotification(userId: number, serviceName: string) {
    const notification = await this.create({
      id_usuario_destinatario: userId,
      titulo_notificacion: 'Califica tu experiencia',
      mensaje_notificacion: `¿Qué tal estuvo tu experiencia con ${serviceName}? Tu opinión nos ayuda a mejorar el servicio.`,
      tipo_notificacion: 'info',
      entidad_relacionada: 'ServiceRating',
      fecha_expiracion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 días
    });

    this.logger.log(`✅ Notificación de recordatorio de calificación creada para usuario: ${userId}`);
    return notification;
  }

  async createTouristPointApprovedNotification(userId: number, pointName: string, pointId: number) {
    const notification = await this.create({
      id_usuario_destinatario: userId,
      titulo_notificacion: 'Punto turístico aprobado',
      mensaje_notificacion: `¡Felicitaciones! Tu punto turístico "${pointName}" ha sido aprobado y ya está disponible para otros usuarios.`,
      tipo_notificacion: 'success',
      entidad_relacionada: 'TouristPoint',
      entidad_id: pointId,
      fecha_expiracion: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 días
    });

    this.logger.log(`✅ Notificación de aprobación de punto turístico creada: ${pointName}`);
    return notification;
  }

  async createTouristPointRejectedNotification(userId: number, pointName: string, reason?: string) {
    const message = reason
      ? `Tu punto turístico "${pointName}" no fue aprobado. Motivo: ${reason}. Puedes editarlo y volver a enviarlo.`
      : `Tu punto turístico "${pointName}" no fue aprobado. Puedes editarlo y volver a enviarlo.`;

    const notification = await this.create({
      id_usuario_destinatario: userId,
      titulo_notificacion: 'Punto turístico rechazado',
      mensaje_notificacion: message,
      tipo_notificacion: 'error',
      entidad_relacionada: 'TouristPoint'
    });

    this.logger.log(`✅ Notificación de rechazo de punto turístico creada: ${pointName}`);
    return notification;
  }

  async createNewFeatureNotification(featureName: string, description: string) {
    const notification = await this.create({
      titulo_notificacion: 'Nueva funcionalidad disponible',
      mensaje_notificacion: `¡Novedad! ${featureName}: ${description}. Actualiza la aplicación para disfrutar de esta nueva característica.`,
      tipo_notificacion: 'info',
      entidad_relacionada: 'Feature',
      fecha_expiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
    });

    this.logger.log(`✅ Notificación de nueva funcionalidad creada: ${featureName}`);
    return notification;
  }

  async createSecurityAlertNotification(userId: number, alertType: string, details: string) {
    const notification = await this.create({
      id_usuario_destinatario: userId,
      titulo_notificacion: 'Alerta de seguridad',
      mensaje_notificacion: `Alerta de ${alertType}: ${details}. Si no reconoces esta actividad, contacta al soporte.`,
      tipo_notificacion: 'warning',
      entidad_relacionada: 'Security',
      fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
    });

    this.logger.log(`✅ Notificación de alerta de seguridad creada para usuario: ${userId}`);
    return notification;
  }

  // Métodos utilitarios para administradores
  async sendBulkNotificationToUsers(
    userIds: number[],
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) {
    const notifications: SystemNotification[] = [];

    for (const userId of userIds) {
      const notification = await this.create({
        id_usuario_destinatario: userId,
        titulo_notificacion: title,
        mensaje_notificacion: message,
        tipo_notificacion: type
      });
      notifications.push(notification);
    }

    this.logger.log(`✅ ${notifications.length} notificaciones masivas enviadas`);

    return {
      sent: notifications.length,
      notifications
    };
  }


  async sendNotificationToAllUsers(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const notification = await this.create({
      titulo_notificacion: title,
      mensaje_notificacion: message,
      tipo_notificacion: type
    });

    this.logger.log(`✅ Notificación global enviada: ${title}`);
    return notification;
  }

  async scheduleNotification(
    createNotificationDto: CreateSystemNotificationDto,
    scheduleDate: Date
  ) {
    // En una implementación real, esto podría usar un job queue como Bull
    // Por ahora, simplemente programamos la notificación con fecha de expiración
    const scheduledNotification = await this.create({
      ...createNotificationDto,
      fecha_expiracion: scheduleDate.toISOString()
    });

    this.logger.log(`✅ Notificación programada para: ${scheduleDate.toISOString()}`);
    return scheduledNotification;
  }

  async getNotificationsByEntity(entityType: string, entityId: number) {
    return await this.notificationRepository.find({
      where: {
        entidad_relacionada: entityType,
        entidad_id: entityId
      },
      order: { fecha_creacion: 'DESC' }
    });
  }

  async getNotificationTemplate(templateType: string) {
    const templates = {
      welcome: {
        titulo: '¡Bienvenido a OpenBlind!',
        mensaje: 'Bienvenido a nuestra plataforma de navegación accesible.',
        tipo: 'info' as const
      },
      maintenance: {
        titulo: 'Mantenimiento programado',
        mensaje: 'Se realizará mantenimiento del sistema.',
        tipo: 'warning' as const
      },
      new_feature: {
        titulo: 'Nueva funcionalidad',
        mensaje: 'Hemos agregado una nueva característica.',
        tipo: 'info' as const
      },
      security_alert: {
        titulo: 'Alerta de seguridad',
        mensaje: 'Se ha detectado actividad inusual en tu cuenta.',
        tipo: 'warning' as const
      }
    };

    return templates[templateType] || null;
  }
}

