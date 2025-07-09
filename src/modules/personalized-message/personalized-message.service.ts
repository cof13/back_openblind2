// src/modules/personalized-message/personalized-message.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePersonalizedMessageDto } from './dto/create-personalized-message.dto';
import { UpdatePersonalizedMessageDto } from './dto/update-personalized-message.dto';
import { QueryPersonalizedMessageDto } from './dto/query-personalized-message.dto';
import { PersonalizedMessage } from '../../models/mysql/personalized-message.entity';
import { Route } from '../../models/mysql/route.entity';
import { User } from '../../models/mysql/user.entity';
import { MessageContent } from '../../models/mongodb/message-content.schema';

@Injectable()
export class PersonalizedMessageService {
  private readonly logger = new Logger(PersonalizedMessageService.name);

  constructor(
    @InjectRepository(PersonalizedMessage)
    private readonly messageRepository: Repository<PersonalizedMessage>,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectModel(MessageContent.name)
    private readonly messageContentModel: Model<MessageContent>,
  ) { }

  async create(createMessageDto: CreatePersonalizedMessageDto): Promise<PersonalizedMessage> {
    // Verificar que la ruta existe si se proporciona
    if (createMessageDto.id_ruta) {
      const route = await this.routeRepository.findOne({
        where: { id_ruta: createMessageDto.id_ruta, estado: 'activo' }
      });

      if (!route) {
        throw new BadRequestException(`La ruta con ID ${createMessageDto.id_ruta} no existe o no está activa`);
      }
    }

    // Verificar que el usuario creador existe
    if (createMessageDto.id_usuario_creador) {
      const user = await this.userRepository.findOne({
        where: { id_usuario: createMessageDto.id_usuario_creador, estado: 'activo' }
      });

      if (!user) {
        throw new BadRequestException(`El usuario con ID ${createMessageDto.id_usuario_creador} no existe o no está activo`);
      }
    }

    // Crear contenido detallado en MongoDB primero
    let mongoContentId: string | undefined;
    try {
      const messageContent = new this.messageContentModel({
        message_id: 0, // Se actualizará después
        mensaje: createMessageDto.mensaje,
        traducciones: createMessageDto.traducciones || [],
        audio_files: createMessageDto.audio_files || {},
        configuracion_audio: createMessageDto.configuracion_audio || {
          formato_audio: 'mp3'
        },
        contexto_ubicacion: createMessageDto.contexto_ubicacion || {}
      });

      const savedContent = await messageContent.save();
      mongoContentId = savedContent._id.toString();
      this.logger.log(`✅ Contenido de mensaje creado en MongoDB: ${mongoContentId}`);
    } catch (error) {
      this.logger.warn(`⚠️  Error al crear contenido en MongoDB: ${error.message}`);
    }

    // Crear mensaje en MySQL
    const messageData = {
      mensaje: createMessageDto.mensaje,
      id_ruta: createMessageDto.id_ruta,
      coordenadas: createMessageDto.coordenadas,
      estado: createMessageDto.estado || 'activo' as const,
      tipo_mensaje: createMessageDto.tipo_mensaje || 'informativo' as const,
      id_usuario_creador: createMessageDto.id_usuario_creador,
      content_mongo_id: mongoContentId,
    };

    const message = this.messageRepository.create(messageData);
    const savedMessage = await this.messageRepository.save(message);

    // Actualizar el message_id en MongoDB
    if (mongoContentId) {
      try {
        await this.messageContentModel.findByIdAndUpdate(
          mongoContentId,
          { message_id: savedMessage.id_mensaje }
        );
      } catch (error) {
        this.logger.warn(`⚠️  Error al actualizar message_id en MongoDB: ${error.message}`);
      }
    }

    this.logger.log(`✅ Mensaje personalizado creado: ${savedMessage.id_mensaje}`);
    return this.findOne(savedMessage.id_mensaje);
  }

  async findAll(queryDto?: QueryPersonalizedMessageDto) {
    const page = queryDto?.page || 1;
    const limit = queryDto?.limit || 10;
    const offset = (page - 1) * limit;

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.route', 'route')
      .leftJoinAndSelect('message.creator', 'creator')
      .leftJoinAndSelect('creator.role', 'role');

    // Aplicar filtros
    if (queryDto?.estado) {
      queryBuilder.andWhere('message.estado = :estado', { estado: queryDto.estado });
    }

    if (queryDto?.tipo_mensaje) {
      queryBuilder.andWhere('message.tipo_mensaje = :tipo_mensaje', { tipo_mensaje: queryDto.tipo_mensaje });
    }

    if (queryDto?.id_ruta) {
      queryBuilder.andWhere('message.id_ruta = :id_ruta', { id_ruta: queryDto.id_ruta });
    }

    if (queryDto?.id_usuario_creador) {
      queryBuilder.andWhere('message.id_usuario_creador = :id_usuario_creador', {
        id_usuario_creador: queryDto.id_usuario_creador
      });
    }

    if (queryDto?.search) {
      queryBuilder.andWhere(
        '(message.mensaje LIKE :search OR route.nombre_ruta LIKE :search)',
        { search: `%${queryDto.search}%` }
      );
    }

    // Aplicar paginación y ordenamiento
    queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('message.fecha_creacion', 'DESC');

    const [messages, total] = await queryBuilder.getManyAndCount();

    return {
      data: messages,
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

  async findOne(id: number): Promise<PersonalizedMessage> {
    const message = await this.messageRepository.findOne({
      where: { id_mensaje: id },
      relations: [
        'route',
        'creator',
        'creator.role',
        'voice_guides',
        'route_messages'
      ]
    });

    if (!message) {
      throw new NotFoundException(`Mensaje con ID ${id} no encontrado`);
    }

    return message;
  }

  async findOneWithDetails(id: number) {
    const message = await this.findOne(id);

    let content = null;
    if (message.content_mongo_id) {
      try {
        content = await this.messageContentModel.findById(message.content_mongo_id);
      } catch (error) {
        this.logger.warn(`⚠️  Error al obtener contenido MongoDB: ${error.message}`);
      }
    }

    return {
      message,
      content,
      totalVoiceGuides: message.voice_guides?.length || 0,
      totalRouteAssignments: message.route_messages?.length || 0
    };
  }

  async update(id: number, updateMessageDto: UpdatePersonalizedMessageDto): Promise<PersonalizedMessage> {
    const message = await this.findOne(id);

    // Verificar ruta si se está actualizando
    if (updateMessageDto.id_ruta && updateMessageDto.id_ruta !== message.id_ruta) {
      const route = await this.routeRepository.findOne({
        where: { id_ruta: updateMessageDto.id_ruta, estado: 'activo' }
      });

      if (!route) {
        throw new BadRequestException(`La ruta con ID ${updateMessageDto.id_ruta} no existe o no está activa`);
      }
    }

    // Verificar usuario creador si se está actualizando
    if (updateMessageDto.id_usuario_creador && updateMessageDto.id_usuario_creador !== message.id_usuario_creador) {
      const user = await this.userRepository.findOne({
        where: { id_usuario: updateMessageDto.id_usuario_creador, estado: 'activo' }
      });

      if (!user) {
        throw new BadRequestException(`El usuario con ID ${updateMessageDto.id_usuario_creador} no existe o no está activo`);
      }
    }

    // Actualizar contenido en MongoDB si existe
    if (message.content_mongo_id) {
      try {
        const updateFields: any = {};

        if (updateMessageDto.mensaje) updateFields.mensaje = updateMessageDto.mensaje;
        if (updateMessageDto.traducciones) updateFields.traducciones = updateMessageDto.traducciones;
        if (updateMessageDto.audio_files) updateFields.audio_files = updateMessageDto.audio_files;
        if (updateMessageDto.configuracion_audio) updateFields.configuracion_audio = updateMessageDto.configuracion_audio;
        if (updateMessageDto.contexto_ubicacion) updateFields.contexto_ubicacion = updateMessageDto.contexto_ubicacion;

        if (Object.keys(updateFields).length > 0) {
          await this.messageContentModel.findByIdAndUpdate(
            message.content_mongo_id,
            { $set: updateFields }
          );
        }
      } catch (error) {
        this.logger.warn(`⚠️  Error al actualizar contenido MongoDB: ${error.message}`);
      }
    }

    // Actualizar mensaje en MySQL
    await this.messageRepository.update(id, updateMessageDto);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const message = await this.findOne(id);

    // Verificar que no tenga guías de voz asociadas
    if (message.voice_guides && message.voice_guides.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el mensaje porque tiene ${message.voice_guides.length} guías de voz asociadas`
      );
    }

    // Verificar que no esté asignado a rutas
    if (message.route_messages && message.route_messages.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el mensaje porque está asignado a ${message.route_messages.length} rutas`
      );
    }

    // Eliminar contenido de MongoDB si existe
    if (message.content_mongo_id) {
      try {
        await this.messageContentModel.findByIdAndDelete(message.content_mongo_id);
        this.logger.log(`✅ Contenido MongoDB eliminado: ${message.content_mongo_id}`);
      } catch (error) {
        this.logger.warn(`⚠️  Error al eliminar contenido MongoDB: ${error.message}`);
      }
    }

    // Eliminar mensaje de MySQL
    await this.messageRepository.delete(id);
    this.logger.log(`✅ Mensaje eliminado: ${id}`);
  }

  async findActiveMessages() {
    return await this.messageRepository.find({
      where: { estado: 'activo' },
      relations: ['route', 'creator'],
      order: { fecha_creacion: 'DESC' }
    });
  }

  async findByRoute(routeId: number) {
    return await this.messageRepository.find({
      where: { id_ruta: routeId, estado: 'activo' },
      relations: ['creator'],
      order: { fecha_creacion: 'DESC' }
    });
  }

  async findByType(tipo: 'informativo' | 'advertencia' | 'direccional') {
    return await this.messageRepository.find({
      where: { tipo_mensaje: tipo, estado: 'activo' },
      relations: ['route', 'creator'],
      order: { fecha_creacion: 'DESC' }
    });
  }

  async getMessageStatistics() {
    const total = await this.messageRepository.count();
    const active = await this.messageRepository.count({ where: { estado: 'activo' } });
    const inactive = await this.messageRepository.count({ where: { estado: 'inactivo' } });

    const byType = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.tipo_mensaje', 'tipo')
      .addSelect('COUNT(*)', 'count')
      .groupBy('message.tipo_mensaje')
      .getRawMany();

    const byRoute = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.route', 'route')
      .select('route.nombre_ruta', 'ruta')
      .addSelect('COUNT(*)', 'count')
      .where('message.id_ruta IS NOT NULL')
      .groupBy('route.nombre_ruta')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const withVoiceGuides = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.voice_guides', 'voice_guide')
      .where('voice_guide.id_guia IS NOT NULL')
      .getCount();

    return {
      total,
      active,
      inactive,
      withVoiceGuides,
      withoutVoiceGuides: total - withVoiceGuides,
      byType,
      topRoutes: byRoute
    };
  }

  async addTranslation(messageId: number, idioma: string, texto: string) {
    const message = await this.findOne(messageId);

    if (!message.content_mongo_id) {
      throw new BadRequestException('El mensaje no tiene contenido detallado en MongoDB');
    }

    try {
      await this.messageContentModel.findByIdAndUpdate(
        message.content_mongo_id,
        {
          $push: {
            traducciones: {
              idioma,
              texto,
              estado: 'traducido'
            }
          }
        }
      );

      this.logger.log(`✅ Traducción agregada: ${idioma} para mensaje ${messageId}`);
      return { message: 'Traducción agregada exitosamente' };
    } catch (error) {
      this.logger.error(`❌ Error al agregar traducción: ${error.message}`);
      throw new BadRequestException('Error al agregar la traducción');
    }
  }

  async updateAudioFile(messageId: number, idioma: string, audioUrl: string) {
    const message = await this.findOne(messageId);

    if (!message.content_mongo_id) {
      throw new BadRequestException('El mensaje no tiene contenido detallado en MongoDB');
    }

    try {
      const updateField = `audio_files.${idioma}`;
      await this.messageContentModel.findByIdAndUpdate(
        message.content_mongo_id,
        { $set: { [updateField]: audioUrl } }
      );

      this.logger.log(`✅ Audio actualizado: ${idioma} para mensaje ${messageId}`);
      return { message: 'Archivo de audio actualizado exitosamente' };
    } catch (error) {
      this.logger.error(`❌ Error al actualizar audio: ${error.message}`);
      throw new BadRequestException('Error al actualizar el archivo de audio');
    }
  }

  async getMessagesNeedingTranslation(targetLanguage: string = 'en') {
    try {
      const messages = await this.messageContentModel.find({
        $or: [
          { traducciones: { $size: 0 } },
          { [`traducciones.idioma`]: { $ne: targetLanguage } }
        ]
      });

      return messages;
    } catch (error) {
      this.logger.error(`❌ Error al obtener mensajes para traducir: ${error.message}`);
      return [];
    }
  }

  async getMessagesWithoutAudio() {
    try {
      const messages = await this.messageContentModel.find({
        $or: [
          { 'audio_files.es': { $exists: false } },
          { 'audio_files.es': null },
          { 'audio_files.es': '' }
        ]
      });

      return messages;
    } catch (error) {
      this.logger.error(`❌ Error al obtener mensajes sin audio: ${error.message}`);
      return [];
    }
  }
}

