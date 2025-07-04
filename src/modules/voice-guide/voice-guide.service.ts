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
import { HydratedDocument } from 'mongoose';
import { CreateVoiceGuideDto } from './dto/create-voice-guide.dto';
import { UpdateVoiceGuideDto } from './dto/update-voice-guide.dto';
import { QueryVoiceGuideDto } from './dto/query-voice-guide.dto';
import { VoiceGuide } from '../../models/mysql/voice-guide.entity';
import { Route } from '../../models/mysql/route.entity';
import { PersonalizedMessage } from '../../models/mysql/personalized-message.entity';
import { VoiceGuide as MongoVoiceGuide } from '../../models/mongodb/voice-guide.schema';


type VoiceGuideDocument = HydratedDocument<MongoVoiceGuide>;


@Injectable()
export class VoiceGuideService {
  private readonly logger = new Logger(VoiceGuideService.name);


  constructor(
    @InjectRepository(VoiceGuide)
    private readonly voiceGuideRepository: Repository<VoiceGuide>,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    @InjectRepository(PersonalizedMessage)
    private readonly messageRepository: Repository<PersonalizedMessage>,
    @InjectModel(MongoVoiceGuide.name)
    private readonly voiceGuideModel: Model<VoiceGuideDocument>,


  ) { }



  async create(createVoiceGuideDto: CreateVoiceGuideDto): Promise<VoiceGuide> {
    // Verificar que la ruta existe y está activa
    const route = await this.routeRepository.findOne({
      where: { id_ruta: createVoiceGuideDto.id_ruta, estado: 'activo' }
    });

    if (!route) {
      throw new BadRequestException(`La ruta con ID ${createVoiceGuideDto.id_ruta} no existe o no está activa`);
    }

    // Verificar que el mensaje existe y está activo
    const message = await this.messageRepository.findOne({
      where: { id_mensaje: createVoiceGuideDto.id_mensaje, estado: 'activo' }
    });

    if (!message) {
      throw new BadRequestException(`El mensaje con ID ${createVoiceGuideDto.id_mensaje} no existe o no está activo`);
    }

    // Verificar que el mensaje pertenece a la ruta (si está asociado a una ruta)
    if (message.id_ruta && message.id_ruta !== createVoiceGuideDto.id_ruta) {
      throw new BadRequestException(`El mensaje no pertenece a la ruta especificada`);
    }

    // Crear datos adicionales en MongoDB
    let mongoGuideId: string | undefined;
    try {
      const voiceGuideData = new this.voiceGuideModel({
        id_ruta: createVoiceGuideDto.id_ruta,
        id_mensaje: createVoiceGuideDto.id_mensaje,
        archivo_audio_url: createVoiceGuideDto.archivo_audio_url,
        duracion_segundos: createVoiceGuideDto.duracion_segundos,
        idioma: createVoiceGuideDto.idioma || 'es',
        velocidad_reproduccion: createVoiceGuideDto.velocidad_reproduccion || 'normal',
        estado: createVoiceGuideDto.estado || 'procesando',
        metadatos_audio: createVoiceGuideDto.metadatos_audio || {
          formato: 'mp3',
          calidad: 'media'
        },
        estadisticas_uso: {
          total_reproducciones: 0,
          tiempo_promedio_escucha: 0,
          usuarios_unicos: 0
        }
      });

      const savedMongoGuide = await voiceGuideData.save();
      mongoGuideId = savedMongoGuide._id.toString(); // <--- Changed here
      this.logger.log(`✅ Guía de voz creada en MongoDB: ${mongoGuideId}`);
    } catch (error) {
      this.logger.warn(`⚠️  Error al crear guía en MongoDB: ${error.message}`);
    }

    // Crear guía de voz en MySQL
    const voiceGuideData = {
      id_ruta: createVoiceGuideDto.id_ruta,
      id_mensaje: createVoiceGuideDto.id_mensaje,
      archivo_audio_url: createVoiceGuideDto.archivo_audio_url,
      duracion_segundos: createVoiceGuideDto.duracion_segundos,
      idioma: createVoiceGuideDto.idioma || 'es',
      velocidad_reproduccion: createVoiceGuideDto.velocidad_reproduccion || 'normal' as const,
      estado: createVoiceGuideDto.estado || 'procesando' as const,
      fecha_registro: new Date(),
    };

    const voiceGuide = this.voiceGuideRepository.create(voiceGuideData);
    const savedVoiceGuide = await this.voiceGuideRepository.save(voiceGuide);

    this.logger.log(`✅ Guía de voz creada: ${savedVoiceGuide.id_guia}`);
    return this.findOne(savedVoiceGuide.id_guia);
  }

  async findAll(queryDto?: QueryVoiceGuideDto) {
    const page = queryDto?.page || 1;
    const limit = queryDto?.limit || 10;
    const offset = (page - 1) * limit;

    const queryBuilder = this.voiceGuideRepository
      .createQueryBuilder('voiceGuide')
      .leftJoinAndSelect('voiceGuide.route', 'route')
      .leftJoinAndSelect('voiceGuide.message', 'message');

    // Aplicar filtros
    if (queryDto?.estado) {
      queryBuilder.andWhere('voiceGuide.estado = :estado', { estado: queryDto.estado });
    }

    if (queryDto?.idioma) {
      queryBuilder.andWhere('voiceGuide.idioma = :idioma', { idioma: queryDto.idioma });
    }

    if (queryDto?.velocidad_reproduccion) {
      queryBuilder.andWhere('voiceGuide.velocidad_reproduccion = :velocidad', { velocidad: queryDto.velocidad_reproduccion });
    }

    if (queryDto?.id_ruta) {
      queryBuilder.andWhere('voiceGuide.id_ruta = :id_ruta', { id_ruta: queryDto.id_ruta });
    }

    if (queryDto?.id_mensaje) {
      queryBuilder.andWhere('voiceGuide.id_mensaje = :id_mensaje', { id_mensaje: queryDto.id_mensaje });
    }

    // Aplicar paginación y ordenamiento
    queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('voiceGuide.fecha_creacion', 'DESC');

    const [voiceGuides, total] = await queryBuilder.getManyAndCount();

    return {
      data: voiceGuides,
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

  async findOne(id: number): Promise<VoiceGuide> {
    const voiceGuide = await this.voiceGuideRepository.findOne({
      where: { id_guia: id },
      relations: ['route', 'message']
    });

    if (!voiceGuide) {
      throw new NotFoundException(`Guía de voz con ID ${id} no encontrada`);
    }

    return voiceGuide;
  }

  async findOneWithStats(id: number) {
    const voiceGuide = await this.findOne(id);

    let mongoStats: VoiceGuideDocument | null = null;

    try {
      mongoStats = await this.voiceGuideModel.findOne({
        id_ruta: voiceGuide.id_ruta,
        id_mensaje: voiceGuide.id_mensaje,
        archivo_audio_url: voiceGuide.archivo_audio_url
      });
    } catch (error) {
      this.logger.warn(`⚠️  Error al obtener estadísticas MongoDB: ${error.message}`);
    }

    return {
      voiceGuide,
      stats: mongoStats?.estadisticas_uso || null,
      metadata: mongoStats?.metadatos_audio || null
    };
  }


  async update(id: number, updateVoiceGuideDto: UpdateVoiceGuideDto): Promise<VoiceGuide> {
    const voiceGuide = await this.findOne(id);

    // Verificar ruta si se está actualizando
    if (updateVoiceGuideDto.id_ruta && updateVoiceGuideDto.id_ruta !== voiceGuide.id_ruta) {
      const route = await this.routeRepository.findOne({
        where: { id_ruta: updateVoiceGuideDto.id_ruta, estado: 'activo' }
      });

      if (!route) {
        throw new BadRequestException(`La ruta con ID ${updateVoiceGuideDto.id_ruta} no existe o no está activa`);
      }
    }

    // Verificar mensaje si se está actualizando
    if (updateVoiceGuideDto.id_mensaje && updateVoiceGuideDto.id_mensaje !== voiceGuide.id_mensaje) {
      const message = await this.messageRepository.findOne({
        where: { id_mensaje: updateVoiceGuideDto.id_mensaje, estado: 'activo' }
      });

      if (!message) {
        throw new BadRequestException(`El mensaje con ID ${updateVoiceGuideDto.id_mensaje} no existe o no está activo`);
      }
    }

    // Actualizar datos en MongoDB si existe
    try {
      await this.voiceGuideModel.findOneAndUpdate(
        {
          id_ruta: voiceGuide.id_ruta,
          id_mensaje: voiceGuide.id_mensaje,
          archivo_audio_url: voiceGuide.archivo_audio_url
        },
        {
          $set: {
            ...(updateVoiceGuideDto.duracion_segundos && { duracion_segundos: updateVoiceGuideDto.duracion_segundos }),
            ...(updateVoiceGuideDto.idioma && { idioma: updateVoiceGuideDto.idioma }),
            ...(updateVoiceGuideDto.velocidad_reproduccion && { velocidad_reproduccion: updateVoiceGuideDto.velocidad_reproduccion }),
            ...(updateVoiceGuideDto.estado && { estado: updateVoiceGuideDto.estado }),
            ...(updateVoiceGuideDto.metadatos_audio && { metadatos_audio: updateVoiceGuideDto.metadatos_audio })
          }
        }
      );
    } catch (error) {
      this.logger.warn(`⚠️  Error al actualizar MongoDB: ${error.message}`);
    }

    // Actualizar en MySQL
    await this.voiceGuideRepository.update(id, updateVoiceGuideDto);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const voiceGuide = await this.findOne(id);

    // Eliminar de MongoDB si existe
    try {
      await this.voiceGuideModel.findOneAndDelete({
        id_ruta: voiceGuide.id_ruta,
        id_mensaje: voiceGuide.id_mensaje,
        archivo_audio_url: voiceGuide.archivo_audio_url
      });
      this.logger.log(`✅ Guía de voz eliminada de MongoDB`);
    } catch (error) {
      this.logger.warn(`⚠️  Error al eliminar de MongoDB: ${error.message}`);
    }

    // Eliminar de MySQL
    await this.voiceGuideRepository.delete(id);
    this.logger.log(`✅ Guía de voz eliminada: ${id}`);
  }

  async findByRoute(routeId: number) {
    return await this.voiceGuideRepository.find({
      where: { id_ruta: routeId, estado: 'activo' },
      relations: ['message'],
      order: { fecha_creacion: 'DESC' }
    });
  }

  async findByMessage(messageId: number) {
    return await this.voiceGuideRepository.find({
      where: { id_mensaje: messageId },
      relations: ['route'],
      order: { idioma: 'ASC', velocidad_reproduccion: 'ASC' }
    });
  }

  async findActiveGuides() {
    return await this.voiceGuideRepository.find({
      where: { estado: 'activo' },
      relations: ['route', 'message'],
      order: { fecha_creacion: 'DESC' }
    });
  }

  async updatePlaybackStats(id: number, playbackTime: number) {
    const voiceGuide = await this.findOne(id);

    try {
      await this.voiceGuideModel.findOneAndUpdate(
        {
          id_ruta: voiceGuide.id_ruta,
          id_mensaje: voiceGuide.id_mensaje,
          archivo_audio_url: voiceGuide.archivo_audio_url
        },
        {
          $inc: {
            'estadisticas_uso.total_reproducciones': 1,
            'estadisticas_uso.usuarios_unicos': 1
          },
          $set: {
            'estadisticas_uso.tiempo_promedio_escucha': playbackTime
          }
        }
      );
    } catch (error) {
      this.logger.warn(`⚠️  Error al actualizar estadísticas: ${error.message}`);
    }
  }

  async getVoiceGuideStatistics() {
    const total = await this.voiceGuideRepository.count();
    const active = await this.voiceGuideRepository.count({ where: { estado: 'activo' } });
    const processing = await this.voiceGuideRepository.count({ where: { estado: 'procesando' } });
    const inactive = await this.voiceGuideRepository.count({ where: { estado: 'inactivo' } });

    const byLanguage = await this.voiceGuideRepository
      .createQueryBuilder('guide')
      .select('guide.idioma', 'idioma')
      .addSelect('COUNT(*)', 'count')
      .groupBy('guide.idioma')
      .getRawMany();

    const bySpeed = await this.voiceGuideRepository
      .createQueryBuilder('guide')
      .select('guide.velocidad_reproduccion', 'velocidad')
      .addSelect('COUNT(*)', 'count')
      .groupBy('guide.velocidad_reproduccion')
      .getRawMany();

    return {
      total,
      active,
      processing,
      inactive,
      byLanguage,
      bySpeed
    };
  }
}
