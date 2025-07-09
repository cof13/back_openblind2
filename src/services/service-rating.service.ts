// src/modules/service-rating/service-rating.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateServiceRatingDto } from '../modules/service-rating/dto/create-service-rating.dto';
import { UpdateServiceRatingDto } from '../modules/service-rating/dto/update-service-rating.dto';
import { QueryServiceRatingDto } from '../modules/service-rating/dto/query-service-rating.dto';
import { ServiceRating } from '../models/mysql/service-rating.entity';
import { User } from '../models/mysql/user.entity';
import { ServiceRating as MongoServiceRating } from '../models/mongodb/service-rating.schema';

@Injectable()
export class ServiceRatingService {
  private readonly logger = new Logger(ServiceRatingService.name);

  constructor(
    @InjectRepository(ServiceRating)
    private readonly serviceRatingRepository: Repository<ServiceRating>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectModel(MongoServiceRating.name)
    private readonly mongoServiceRatingModel: Model<MongoServiceRating>,
  ) { }

  async create(createRatingDto: CreateServiceRatingDto): Promise<ServiceRating> {
    // Verificar que el usuario evaluador existe
    if (createRatingDto.id_usuario_evaluador) {
      const user = await this.userRepository.findOne({
        where: { id_usuario: createRatingDto.id_usuario_evaluador, estado: 'activo' }
      });

      if (!user) {
        throw new BadRequestException(`El usuario con ID ${createRatingDto.id_usuario_evaluador} no existe o no está activo`);
      }
    }

    // Verificar que no existe una calificación del mismo usuario para el mismo servicio en el mismo mes/año
    const existingRating = await this.serviceRatingRepository.findOne({
      where: {
        servicio: createRatingDto.servicio,
        mes: createRatingDto.mes,
        anio: createRatingDto.anio,
        id_usuario_evaluador: createRatingDto.id_usuario_evaluador
      }
    });

    if (existingRating) {
      throw new BadRequestException(
        `Ya existe una calificación de este usuario para "${createRatingDto.servicio}" en ${createRatingDto.mes}/${createRatingDto.anio}`
      );
    }

    // Crear detalles extendidos en MongoDB primero
    let mongoRatingId: string | undefined;
    try {
      const mongoServiceRating = new this.mongoServiceRatingModel({
        servicio: createRatingDto.servicio,
        categoria: createRatingDto.categoria,
        puntuacion: createRatingDto.puntuacion,
        mes: createRatingDto.mes,
        anio: createRatingDto.anio,
        observaciones: createRatingDto.observaciones || '',
        id_usuario_evaluador: createRatingDto.id_usuario_evaluador,
        detalles_evaluacion: createRatingDto.detalles_evaluacion || [],
        fecha_evaluacion: new Date()
      });

      const savedMongoRating = await mongoServiceRating.save();
      mongoRatingId = savedMongoRating._id.toString();
      this.logger.log(`✅ Calificación de servicio creada en MongoDB: ${mongoRatingId}`);
    } catch (error) {
      this.logger.warn(`⚠️  Error al crear calificación en MongoDB: ${error.message}`);
    }

    // Crear calificación en MySQL
    const ratingData = {
      servicio: createRatingDto.servicio,
      categoria: createRatingDto.categoria,
      puntuacion: createRatingDto.puntuacion,
      mes: createRatingDto.mes,
      anio: createRatingDto.anio,
      observaciones: createRatingDto.observaciones,
      id_usuario_evaluador: createRatingDto.id_usuario_evaluador,
    };

    const rating = this.serviceRatingRepository.create(ratingData);
    const savedRating = await this.serviceRatingRepository.save(rating);

    this.logger.log(`✅ Calificación de servicio creada: ${savedRating.id_calificacion} - ${savedRating.servicio}`);
    return this.findOne(savedRating.id_calificacion);
  }

  async findAll(queryDto?: QueryServiceRatingDto) {
    const page = queryDto?.page || 1;
    const limit = queryDto?.limit || 10;
    const offset = (page - 1) * limit;

    const queryBuilder = this.serviceRatingRepository
      .createQueryBuilder('rating')
      .leftJoinAndSelect('rating.evaluator', 'evaluator')
      .leftJoinAndSelect('evaluator.role', 'role');

    // Aplicar filtros
    if (queryDto?.servicio) {
      queryBuilder.andWhere('rating.servicio LIKE :servicio', {
        servicio: `%${queryDto.servicio}%`
      });
    }

    if (queryDto?.categoria) {
      queryBuilder.andWhere('rating.categoria LIKE :categoria', {
        categoria: `%${queryDto.categoria}%`
      });
    }

    if (queryDto?.mes) {
      queryBuilder.andWhere('rating.mes = :mes', { mes: queryDto.mes });
    }

    if (queryDto?.anio) {
      queryBuilder.andWhere('rating.anio = :anio', { anio: queryDto.anio });
    }

    if (queryDto?.id_usuario_evaluador) {
      queryBuilder.andWhere('rating.id_usuario_evaluador = :id_usuario_evaluador', {
        id_usuario_evaluador: queryDto.id_usuario_evaluador
      });
    }

    if (queryDto?.min_puntuacion) {
      queryBuilder.andWhere('rating.puntuacion >= :min_puntuacion', {
        min_puntuacion: queryDto.min_puntuacion
      });
    }

    if (queryDto?.search) {
      queryBuilder.andWhere(
        '(rating.servicio LIKE :search OR rating.categoria LIKE :search OR rating.observaciones LIKE :search)',
        { search: `%${queryDto.search}%` }
      );
    }

    // Aplicar paginación y ordenamiento
    queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('rating.fecha_evaluacion', 'DESC');

    const [ratings, total] = await queryBuilder.getManyAndCount();

    return {
      data: ratings,
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

  async findOne(id: number): Promise<ServiceRating> {
    const rating = await this.serviceRatingRepository.findOne({
      where: { id_calificacion: id },
      relations: ['evaluator', 'evaluator.role']
    });

    if (!rating) {
      throw new NotFoundException(`Calificación con ID ${id} no encontrada`);
    }

    return rating;
  }

  async findOneWithDetails(id: number) {
    const rating = await this.findOne(id);

    let details = null;
    try {
      details = await this.mongoServiceRatingModel.findOne({
        servicio: rating.servicio,
        mes: rating.mes,
        anio: rating.anio,
        id_usuario_evaluador: rating.id_usuario_evaluador
      });
    } catch (error) {
      this.logger.warn(`⚠️  Error al obtener detalles MongoDB: ${error.message}`);
    }

    return {
      rating,
      details,
      hasDetailedEvaluation: (details as any)?.detalles_evaluacion?.length > 0
    };

  }

  async update(id: number, updateRatingDto: UpdateServiceRatingDto, userId: number): Promise<ServiceRating> {
    const rating = await this.findOne(id);

    // Verificar que el usuario puede actualizar esta calificación
    // Solo el evaluador original o un administrador pueden actualizar
    if (rating.id_usuario_evaluador !== userId) {
      const user = await this.userRepository.findOne({
        where: { id_usuario: userId },
        relations: ['role']
      });

      if (!user || !['Super Administrador', 'Administrador'].includes(user.role.nombre_rol)) {
        throw new ForbiddenException('No tienes permisos para actualizar esta calificación');
      }
    }

    // Actualizar detalles en MongoDB si existe
    try {
      const updateFields: any = {};

      if (updateRatingDto.servicio) updateFields.servicio = updateRatingDto.servicio;
      if (updateRatingDto.categoria) updateFields.categoria = updateRatingDto.categoria;
      if (updateRatingDto.puntuacion !== undefined) updateFields.puntuacion = updateRatingDto.puntuacion;
      if (updateRatingDto.observaciones !== undefined) updateFields.observaciones = updateRatingDto.observaciones;
      if (updateRatingDto.detalles_evaluacion) updateFields.detalles_evaluacion = updateRatingDto.detalles_evaluacion;

      if (Object.keys(updateFields).length > 0) {
        await this.mongoServiceRatingModel.findOneAndUpdate(
          {
            servicio: rating.servicio,
            mes: rating.mes,
            anio: rating.anio,
            id_usuario_evaluador: rating.id_usuario_evaluador
          },
          { $set: updateFields }
        );
      }
    } catch (error) {
      this.logger.warn(`⚠️  Error al actualizar detalles MongoDB: ${error.message}`);
    }

    // Actualizar calificación en MySQL
    await this.serviceRatingRepository.update(id, updateRatingDto);

    this.logger.log(`✅ Calificación actualizada: ${id}`);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const rating = await this.findOne(id);

    // Eliminar detalles de MongoDB si existe
    try {
      await this.mongoServiceRatingModel.findOneAndDelete({
        servicio: rating.servicio,
        mes: rating.mes,
        anio: rating.anio,
        id_usuario_evaluador: rating.id_usuario_evaluador
      });
      this.logger.log(`✅ Detalles MongoDB eliminados para calificación: ${id}`);
    } catch (error) {
      this.logger.warn(`⚠️  Error al eliminar detalles MongoDB: ${error.message}`);
    }

    // Eliminar calificación de MySQL
    await this.serviceRatingRepository.delete(id);
    this.logger.log(`✅ Calificación eliminada: ${id} - ${rating.servicio}`);
  }

  async findByService(serviceName: string) {
    return await this.serviceRatingRepository.find({
      where: { servicio: serviceName },
      relations: ['evaluator'],
      order: { fecha_evaluacion: 'DESC' }
    });
  }

  async findByCategory(categoryName: string) {
    return await this.serviceRatingRepository.find({
      where: { categoria: categoryName },
      relations: ['evaluator'],
      order: { puntuacion: 'DESC', fecha_evaluacion: 'DESC' }
    });
  }

  async getServiceAverage(serviceName: string) {
    const result = await this.serviceRatingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.puntuacion)', 'promedio')
      .addSelect('COUNT(rating.id_calificacion)', 'total_calificaciones')
      .addSelect('MIN(rating.puntuacion)', 'minima')
      .addSelect('MAX(rating.puntuacion)', 'maxima')
      .where('rating.servicio = :servicio', { servicio: serviceName })
      .getRawOne();

    const recentRatings = await this.serviceRatingRepository.find({
      where: { servicio: serviceName },
      order: { fecha_evaluacion: 'DESC' },
      take: 5
    });

    return {
      servicio: serviceName,
      promedio: parseFloat(result.promedio) || 0,
      total_calificaciones: parseInt(result.total_calificaciones) || 0,
      puntuacion_minima: parseFloat(result.minima) || 0,
      puntuacion_maxima: parseFloat(result.maxima) || 0,
      calificaciones_recientes: recentRatings
    };
  }

  async getMonthlyReport(year: number) {
    const monthlyData = await this.serviceRatingRepository
      .createQueryBuilder('rating')
      .select('rating.mes', 'mes')
      .addSelect('AVG(rating.puntuacion)', 'promedio')
      .addSelect('COUNT(rating.id_calificacion)', 'total')
      .addSelect('rating.categoria', 'categoria')
      .where('rating.anio = :anio', { anio: year })
      .groupBy('rating.mes, rating.categoria')
      .orderBy('rating.mes, rating.categoria')
      .getRawMany();

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const report = {};
    monthlyData.forEach(data => {
      const monthName = monthNames[data.mes - 1];
      if (!report[monthName]) {
        report[monthName] = {};
      }
      report[monthName][data.categoria] = {
        promedio: parseFloat(data.promedio),
        total: parseInt(data.total)
      };
    });

    return {
      año: year,
      reporte_mensual: report
    };
  }

  async getTrendingServices() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const currentMonthRatings = await this.serviceRatingRepository
      .createQueryBuilder('rating')
      .select('rating.servicio', 'servicio')
      .addSelect('AVG(rating.puntuacion)', 'promedio_actual')
      .addSelect('COUNT(rating.id_calificacion)', 'total_actual')
      .where('rating.mes = :mes AND rating.anio = :anio', {
        mes: currentMonth,
        anio: currentYear
      })
      .groupBy('rating.servicio')
      .getRawMany();

    const previousMonthRatings = await this.serviceRatingRepository
      .createQueryBuilder('rating')
      .select('rating.servicio', 'servicio')
      .addSelect('AVG(rating.puntuacion)', 'promedio_anterior')
      .where('rating.mes = :mes AND rating.anio = :anio', {
        mes: previousMonth,
        anio: previousYear
      })
      .groupBy('rating.servicio')
      .getRawMany();

    // Combinar datos y calcular tendencia
    const trending = currentMonthRatings.map(current => {
      const previous = previousMonthRatings.find(p => p.servicio === current.servicio);
      const previousAvg = previous ? parseFloat(previous.promedio_anterior) : 0;
      const currentAvg = parseFloat(current.promedio_actual);
      const trend = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;

      return {
        servicio: current.servicio,
        promedio_actual: currentAvg,
        promedio_anterior: previousAvg,
        tendencia_porcentaje: Math.round(trend * 100) / 100,
        total_calificaciones: parseInt(current.total_actual),
        en_tendencia: trend > 5 // Servicios con mejora > 5%
      };
    });

    return trending.sort((a, b) => b.tendencia_porcentaje - a.tendencia_porcentaje);
  }

  async getRatingStatistics() {
    const total = await this.serviceRatingRepository.count();

    const byCategory = await this.serviceRatingRepository
      .createQueryBuilder('rating')
      .select('rating.categoria', 'categoria')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(rating.puntuacion)', 'promedio')
      .groupBy('rating.categoria')
      .getRawMany();

    const byMonth = await this.serviceRatingRepository
      .createQueryBuilder('rating')
      .select('rating.mes', 'mes')
      .addSelect('rating.anio', 'anio')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(rating.puntuacion)', 'promedio')
      .groupBy('rating.anio, rating.mes')
      .orderBy('rating.anio, rating.mes')
      .getRawMany();

    const topServices = await this.serviceRatingRepository
      .createQueryBuilder('rating')
      .select('rating.servicio', 'servicio')
      .addSelect('AVG(rating.puntuacion)', 'promedio')
      .addSelect('COUNT(*)', 'total_calificaciones')
      .groupBy('rating.servicio')
      .having('COUNT(*) >= 3') // Al menos 3 calificaciones
      .orderBy('AVG(rating.puntuacion)', 'DESC')
      .limit(10)
      .getRawMany();

    const currentYear = new Date().getFullYear();
    const thisYearCount = await this.serviceRatingRepository.count({
      where: { anio: currentYear }
    });

    const averageRating = await this.serviceRatingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.puntuacion)', 'promedio_general')
      .getRawOne();

    return {
      total,
      este_año: thisYearCount,
      promedio_general: parseFloat(averageRating.promedio_general) || 0,
      por_categoria: byCategory.map(cat => ({
        categoria: cat.categoria,
        total: parseInt(cat.count),
        promedio: parseFloat(cat.promedio)
      })),
      por_mes: byMonth.map(month => ({
        mes: month.mes,
        año: month.anio,
        total: parseInt(month.count),
        promedio: parseFloat(month.promedio)
      })),
      mejores_servicios: topServices.map(service => ({
        servicio: service.servicio,
        promedio: parseFloat(service.promedio),
        total_calificaciones: parseInt(service.total_calificaciones)
      }))
    };
  }

  async getUniqueServices() {
    const services = await this.serviceRatingRepository
      .createQueryBuilder('rating')
      .select('DISTINCT rating.servicio', 'servicio')
      .addSelect('COUNT(*)', 'total_calificaciones')
      .addSelect('AVG(rating.puntuacion)', 'promedio')
      .groupBy('rating.servicio')
      .orderBy('rating.servicio')
      .getRawMany();

    return services.map(service => ({
      nombre: service.servicio,
      total_calificaciones: parseInt(service.total_calificaciones),
      promedio: parseFloat(service.promedio)
    }));
  }

  async getUniqueCategories() {
    const categories = await this.serviceRatingRepository
      .createQueryBuilder('rating')
      .select('DISTINCT rating.categoria', 'categoria')
      .addSelect('COUNT(*)', 'total_servicios')
      .addSelect('AVG(rating.puntuacion)', 'promedio')
      .groupBy('rating.categoria')
      .orderBy('rating.categoria')
      .getRawMany();

    return categories.map(category => ({
      nombre: category.categoria,
      total_servicios: parseInt(category.total_servicios),
      promedio: parseFloat(category.promedio)
    }));
  }

  async getUserRatings(userId: number) {
    return await this.serviceRatingRepository.find({
      where: { id_usuario_evaluador: userId },
      order: { fecha_evaluacion: 'DESC' }
    });
  }

  async getServiceEvolution(serviceName: string, year: number) {
    const evolution = await this.serviceRatingRepository
      .createQueryBuilder('rating')
      .select('rating.mes', 'mes')
      .addSelect('AVG(rating.puntuacion)', 'promedio')
      .addSelect('COUNT(*)', 'total')
      .where('rating.servicio = :servicio AND rating.anio = :anio', {
        servicio: serviceName,
        anio: year
      })
      .groupBy('rating.mes')
      .orderBy('rating.mes')
      .getRawMany();

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return evolution.map(data => ({
      mes: data.mes,
      nombre_mes: monthNames[data.mes - 1],
      promedio: parseFloat(data.promedio),
      total_calificaciones: parseInt(data.total)
    }));
  }

  async getDetailedServiceAnalysis(serviceName: string) {
    try {
      const analysis = await this.mongoServiceRatingModel.aggregate([
        { $match: { servicio: serviceName } },
        {
          $group: {
            _id: null,
            promedio_general: { $avg: '$puntuacion' },
            total_evaluaciones: { $sum: 1 },
            puntuacion_maxima: { $max: '$puntuacion' },
            puntuacion_minima: { $min: '$puntuacion' },
            aspectos_evaluados: { $push: '$detalles_evaluacion' }
          }
        },
        {
          $project: {
            _id: 0,
            promedio_general: { $round: ['$promedio_general', 2] },
            total_evaluaciones: 1,
            puntuacion_maxima: 1,
            puntuacion_minima: 1,
            aspectos_evaluados: {
              $reduce: {
                input: '$aspectos_evaluados',
                initialValue: [],
                in: { $concatArrays: ['$value', '$this'] }
              }
            }
          }
        }
      ]);

      if (analysis.length === 0) {
        return {
          servicio: serviceName,
          promedio_general: 0,
          total_evaluaciones: 0,
          aspectos_mas_evaluados: []
        };
      }

      const result = analysis[0];

      // Analizar aspectos más evaluados
      const aspectsCount: Record<string, number> = {};
      result.aspectos_evaluados.forEach(aspecto => {
        if (aspecto.aspecto) {
          aspectsCount[aspecto.aspecto] = (aspectsCount[aspecto.aspecto] || 0) + 1;
        }
      });

      const topAspects = Object.entries(aspectsCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([aspecto, count]) => ({ aspecto, frecuencia: count }));


      return {
        servicio: serviceName,
        ...result,
        aspectos_mas_evaluados: topAspects
      };
    } catch (error) {
      this.logger.error(`❌ Error en análisis detallado: ${error.message}`);
      return {
        servicio: serviceName,
        promedio_general: 0,
        total_evaluaciones: 0,
        aspectos_mas_evaluados: []
      };
    }
  }

  async addDetailedEvaluation(ratingId: number, aspectos: Array<{ aspecto: string, puntuacion: number, comentario?: string }>) {
    const rating = await this.findOne(ratingId);

    try {
      await this.mongoServiceRatingModel.findOneAndUpdate(
        {
          servicio: rating.servicio,
          mes: rating.mes,
          anio: rating.anio,
          id_usuario_evaluador: rating.id_usuario_evaluador
        },
        {
          $set: { detalles_evaluacion: aspectos }
        }
      );

      this.logger.log(`✅ Evaluación detallada agregada para calificación ${ratingId}`);
      return { message: 'Evaluación detallada agregada exitosamente' };
    } catch (error) {
      this.logger.error(`❌ Error al agregar evaluación detallada: ${error.message}`);
      throw new BadRequestException('Error al agregar la evaluación detallada');
    }
  }
}
