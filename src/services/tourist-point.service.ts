// src/modules/tourist-point/tourist-point.service.ts
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
import { CreateTouristPointDto } from '../modules/tourist-point/dto/create-tourist-point.dto';
import { UpdateTouristPointDto } from '../modules/tourist-point/dto/update-tourist-point.dto';
import { QueryTouristPointDto } from '../modules/tourist-point/dto/query-tourist-point.dto';
import { AddReviewDto } from '../modules/tourist-point/dto/add-review.dto';
import { TouristPoint } from '../models/mysql/tourist-point.entity';
import { User } from '../models/mysql/user.entity';
import { TouristPoint as MongoTouristPoint } from '../models/mongodb/tourist-point.schema';

@Injectable()
export class TouristPointService {
  private readonly logger = new Logger(TouristPointService.name);

  constructor(
    @InjectRepository(TouristPoint)
    private readonly touristPointRepository: Repository<TouristPoint>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectModel(MongoTouristPoint.name)
    private readonly mongoTouristPointModel: Model<MongoTouristPoint>,
  ) {}

  async create(createTouristPointDto: CreateTouristPointDto): Promise<TouristPoint> {
    // Verificar que el usuario creador existe si se proporciona
    if (createTouristPointDto.id_usuario_creador) {
      const user = await this.userRepository.findOne({
        where: { id_usuario: createTouristPointDto.id_usuario_creador, estado: 'activo' }
      });

      if (!user) {
        throw new BadRequestException(`El usuario con ID ${createTouristPointDto.id_usuario_creador} no existe o no está activo`);
      }
    }

    // Verificar que no existe un punto turístico con las mismas coordenadas exactas
    const existingPoint = await this.touristPointRepository.findOne({
      where: { coordenadas: createTouristPointDto.coordenadas }
    });

    if (existingPoint) {
      throw new BadRequestException(`Ya existe un punto turístico en las coordenadas ${createTouristPointDto.coordenadas}`);
    }

    // Crear datos extendidos en MongoDB primero
    let mongoPointId: string | undefined;
    try {
      const mongoTouristPoint = new this.mongoTouristPointModel({
        lugar_destino: createTouristPointDto.lugar_destino,
        nombre: createTouristPointDto.nombre,
        descripcion: createTouristPointDto.descripcion,
        coordenadas: createTouristPointDto.coordenadas,
        direccion: createTouristPointDto.direccion || '',
        categoria: createTouristPointDto.categoria || 'cultural',
        calificacion_promedio: createTouristPointDto.calificacion_promedio || 0,
        imagenes: createTouristPointDto.imagenes || [],
        informacion_detallada: createTouristPointDto.informacion_detallada || {},
        reviews: createTouristPointDto.reviews || [],
        id_usuario_creador: createTouristPointDto.id_usuario_creador,
        estado: createTouristPointDto.estado || 'pendiente_aprobacion'
      });

      const savedMongoPoint = await mongoTouristPoint.save();
      mongoPointId = savedMongoPoint._id.toString();
      this.logger.log(`✅ Punto turístico creado en MongoDB: ${mongoPointId}`);
    } catch (error) {
      this.logger.warn(`⚠️  Error al crear punto turístico en MongoDB: ${error.message}`);
    }

    // Crear punto turístico en MySQL
    const touristPointData = {
      lugar_destino: createTouristPointDto.lugar_destino,
      nombre: createTouristPointDto.nombre,
      descripcion: createTouristPointDto.descripcion,
      coordenadas: createTouristPointDto.coordenadas,
      direccion: createTouristPointDto.direccion,
      categoria: createTouristPointDto.categoria || 'cultural' as const,
      calificacion_promedio: createTouristPointDto.calificacion_promedio || 0,
      imagen_url: createTouristPointDto.imagenes?.[0], // Primera imagen como principal
      id_usuario_creador: createTouristPointDto.id_usuario_creador,
      estado: createTouristPointDto.estado || 'pendiente_aprobacion' as const,
    };

    const touristPoint = this.touristPointRepository.create(touristPointData);
    const savedTouristPoint = await this.touristPointRepository.save(touristPoint);

    this.logger.log(`✅ Punto turístico creado: ${savedTouristPoint.id_punto} - ${savedTouristPoint.nombre}`);
    return this.findOne(savedTouristPoint.id_punto);
  }

  async findAll(queryDto?: QueryTouristPointDto) {
    const page = queryDto?.page || 1;
    const limit = queryDto?.limit || 10;
    const offset = (page - 1) * limit;

    const queryBuilder = this.touristPointRepository
      .createQueryBuilder('point')
      .leftJoinAndSelect('point.creator', 'creator')
      .leftJoinAndSelect('creator.role', 'role');

    // Aplicar filtros
    if (queryDto?.estado) {
      queryBuilder.andWhere('point.estado = :estado', { estado: queryDto.estado });
    }

    if (queryDto?.categoria) {
      queryBuilder.andWhere('point.categoria = :categoria', { categoria: queryDto.categoria });
    }

    if (queryDto?.id_usuario_creador) {
      queryBuilder.andWhere('point.id_usuario_creador = :id_usuario_creador', { 
        id_usuario_creador: queryDto.id_usuario_creador 
      });
    }

    if (queryDto?.search) {
      queryBuilder.andWhere(
        '(point.nombre LIKE :search OR point.lugar_destino LIKE :search OR point.descripcion LIKE :search)',
        { search: `%${queryDto.search}%` }
      );
    }

    if (queryDto?.min_rating) {
      queryBuilder.andWhere('point.calificacion_promedio >= :min_rating', { 
        min_rating: queryDto.min_rating 
      });
    }

    // Filtro por proximidad si se proporcionan coordenadas
    if (queryDto?.lat && queryDto?.lng) {
      const lat = parseFloat(queryDto.lat);
      const lng = parseFloat(queryDto.lng);
      const radius = queryDto.radius ? parseFloat(queryDto.radius) : 5; // 5km por defecto

      queryBuilder.andWhere(
        `(
          6371 * acos(
            cos(radians(:lat)) * 
            cos(radians(SUBSTRING_INDEX(point.coordenadas, ',', 1))) * 
            cos(radians(SUBSTRING_INDEX(point.coordenadas, ',', -1)) - radians(:lng)) + 
            sin(radians(:lat)) * 
            sin(radians(SUBSTRING_INDEX(point.coordenadas, ',', 1)))
          )
        ) <= :radius`,
        { lat, lng, radius }
      );
    }

    // Aplicar paginación y ordenamiento
    queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('point.calificacion_promedio', 'DESC')
      .addOrderBy('point.fecha_creacion', 'DESC');

    const [points, total] = await queryBuilder.getManyAndCount();

    return {
      data: points,
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

  async findOne(id: number): Promise<TouristPoint> {
    const point = await this.touristPointRepository.findOne({
      where: { id_punto: id },
      relations: ['creator', 'creator.role']
    });

    if (!point) {
      throw new NotFoundException(`Punto turístico con ID ${id} no encontrado`);
    }

    return point;
  }

  async findOneWithDetails(id: number) {
    const point = await this.findOne(id);
    
    let details = null;
    try {
      details = await this.mongoTouristPointModel.findOne({
        $or: [
          { nombre: point.nombre, coordenadas: point.coordenadas },
          { lugar_destino: point.lugar_destino, nombre: point.nombre }
        ]
      });
    } catch (error) {
      this.logger.warn(`⚠️  Error al obtener detalles MongoDB: ${error.message}`);
    }

    return {
      point,
      details,
      totalReviews: (details as any)?.reviews?.length,
      averageRating:(details as any)?.calificacion_promedio
    };
  }

  async update(id: number, updateTouristPointDto: UpdateTouristPointDto): Promise<TouristPoint> {
    const point = await this.findOne(id);

    // Verificar coordenadas únicas si se están actualizando
    if (updateTouristPointDto.coordenadas && updateTouristPointDto.coordenadas !== point.coordenadas) {
      const existingPoint = await this.touristPointRepository.findOne({
        where: { coordenadas: updateTouristPointDto.coordenadas },
      });

      if (existingPoint && existingPoint.id_punto !== id) {
        throw new BadRequestException(`Ya existe un punto turístico en las coordenadas ${updateTouristPointDto.coordenadas}`);
      }
    }

    // Actualizar punto turístico en MySQL
    const updateData: Partial<TouristPoint> = { ...updateTouristPointDto };
    if (updateTouristPointDto.imagenes && updateTouristPointDto.imagenes.length > 0) {
      updateData.imagen_url = updateTouristPointDto.imagenes[0];
    }

    await this.touristPointRepository.update(id, updateData);

    // Actualizar detalles en MongoDB si existe
    try {
      await this.mongoTouristPointModel.findOneAndUpdate(
        {
          $or: [
            { nombre: point.nombre, coordenadas: point.coordenadas },
            { lugar_destino: point.lugar_destino, nombre: point.nombre },
          ],
        },
        { $set: updateTouristPointDto },
      );
    } catch (error) {
      this.logger.warn(`⚠️  Error al actualizar detalles MongoDB: ${error.message}`);
    }
    
    this.logger.log(`✅ Punto turístico actualizado: ${id}`);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const point = await this.findOne(id);

    // Eliminar detalles de MongoDB si existe
    try {
      await this.mongoTouristPointModel.findOneAndDelete({
        $or: [
          { nombre: point.nombre, coordenadas: point.coordenadas },
          { lugar_destino: point.lugar_destino, nombre: point.nombre }
        ]
      });
      this.logger.log(`✅ Detalles MongoDB eliminados para punto: ${id}`);
    } catch (error) {
      this.logger.warn(`⚠️  Error al eliminar detalles MongoDB: ${error.message}`);
    }

    // Eliminar punto turístico de MySQL
    await this.touristPointRepository.delete(id);
    this.logger.log(`✅ Punto turístico eliminado: ${id} - ${point.nombre}`);
  }

  async findActivePoints() {
    return await this.touristPointRepository.find({
      where: { estado: 'activo' },
      relations: ['creator'],
      order: { calificacion_promedio: 'DESC', fecha_creacion: 'DESC' }
    });
  }

  async findByCategory(category: string) {
    return await this.touristPointRepository.find({
      where: { 
        categoria: category as any, 
        estado: 'activo' 
      },
      relations: ['creator'],
      order: { calificacion_promedio: 'DESC' }
    });
  }

  async findNearby(lat: number, lng: number, radius: number = 2) {
    // Implementar búsqueda por proximidad usando coordenadas
    const points = await this.touristPointRepository.find({
      where: { estado: 'activo' },
      relations: ['creator']
    });

    const nearbyPoints = points.filter(point => {
      try {
        const [pointLat, pointLng] = point.coordenadas.split(',').map(coord => parseFloat(coord.trim()));
        
        if (isNaN(pointLat) || isNaN(pointLng)) {
          this.logger.warn(`Coordenadas inválidas para punto ${point.id_punto}: ${point.coordenadas}`);
          return false;
        }
        
        const distance = this.calculateDistance(lat, lng, pointLat, pointLng);
        return distance <= radius;
      } catch (error) {
        this.logger.warn(`Error procesando coordenadas de punto ${point.id_punto}: ${error.message}`);
        return false;
      }
    });

    // Ordenar por distancia
    return nearbyPoints
      .map(point => {
        const [pointLat, pointLng] = point.coordenadas.split(',').map(coord => parseFloat(coord.trim()));
        const distance = this.calculateDistance(lat, lng, pointLat, pointLng);
        return { ...point, distance };
      })
      .sort((a, b) => a.distance - b.distance);
  }

  async findTopRated(limit: number = 10) {
    return await this.touristPointRepository.find({
      where: { estado: 'activo' },
      relations: ['creator'],
      order: { calificacion_promedio: 'DESC', fecha_creacion: 'DESC' },
      take: limit
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  async getTouristPointStatistics() {
    const total = await this.touristPointRepository.count();
    const active = await this.touristPointRepository.count({ where: { estado: 'activo' } });
    const pending = await this.touristPointRepository.count({ where: { estado: 'pendiente_aprobacion' } });
    const inactive = await this.touristPointRepository.count({ where: { estado: 'inactivo' } });
    
    const byCategory = await this.touristPointRepository
      .createQueryBuilder('point')
      .select('point.categoria', 'categoria')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(point.calificacion_promedio)', 'promedio_calificacion')
      .groupBy('point.categoria')
      .getRawMany();

    const topRated = await this.touristPointRepository
      .createQueryBuilder('point')
      .where('point.estado = :estado', { estado: 'activo' })
      .orderBy('point.calificacion_promedio', 'DESC')
      .limit(5)
      .getMany();

    const recentlyAdded = await this.touristPointRepository
      .createQueryBuilder('point')
      .where('point.estado = :estado', { estado: 'activo' })
      .orderBy('point.fecha_creacion', 'DESC')
      .limit(5)
      .getMany();

    return {
      total,
      active,
      pending,
      inactive,
      byCategory,
      topRated,
      recentlyAdded
    };
  }

  async addReview(pointId: number, userId: number, reviewDto: AddReviewDto) {
    const point = await this.findOne(pointId);
    
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({
      where: { id_usuario: userId, estado: 'activo' }
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado o inactivo');
    }

    try {
      // Buscar el punto en MongoDB
      let mongoPoint = await this.mongoTouristPointModel.findOne({
        $or: [
          { nombre: point.nombre, coordenadas: point.coordenadas },
          { lugar_destino: point.lugar_destino, nombre: point.nombre }
        ]
      });

      // Si no existe en MongoDB, crearlo
      if (!mongoPoint) {
        mongoPoint = new this.mongoTouristPointModel({
          lugar_destino: point.lugar_destino,
          nombre: point.nombre,
          descripcion: point.descripcion,
          coordenadas: point.coordenadas,
          direccion: point.direccion || '',
          categoria: point.categoria,
          calificacion_promedio: point.calificacion_promedio,
          imagenes: [],
          reviews: []
        });
        await mongoPoint.save();
      }

      // Verificar si el usuario ya tiene una reseña
      const existingReviewIndex = mongoPoint.reviews.findIndex(
        review => review.usuario_id === userId
      );

      const newReview = {
        usuario_id: userId,
        calificacion: reviewDto.calificacion,
        comentario: reviewDto.comentario,
        fecha: new Date()
      };

      if (existingReviewIndex >= 0) {
        // Actualizar reseña existente
        mongoPoint.reviews[existingReviewIndex] = newReview;
      } else {
        // Agregar nueva reseña
        mongoPoint.reviews.push(newReview);
      }

      // Recalcular calificación promedio
      const totalCalificaciones = mongoPoint.reviews.reduce((sum, review) => sum + review.calificacion, 0);
      const nuevoPromedio = totalCalificaciones / mongoPoint.reviews.length;
      mongoPoint.calificacion_promedio = Math.round(nuevoPromedio * 100) / 100;

      await mongoPoint.save();

      // Actualizar calificación promedio en MySQL
      await this.touristPointRepository.update(pointId, {
        calificacion_promedio: mongoPoint.calificacion_promedio
      });

      this.logger.log(`✅ Reseña agregada por usuario ${userId} para punto ${pointId}`);
      
      return {
        message: 'Reseña agregada exitosamente',
        newAverage: mongoPoint.calificacion_promedio,
        totalReviews: mongoPoint.reviews.length
      };
    } catch (error) {
      this.logger.error(`❌ Error al agregar reseña: ${error.message}`);
      throw new BadRequestException('Error al agregar la reseña');
    }
  }

  async approve(id: number): Promise<TouristPoint> {
    const point = await this.findOne(id);
    
    if (point.estado !== 'pendiente_aprobacion') {
      throw new BadRequestException('El punto turístico no está pendiente de aprobación');
    }

    await this.touristPointRepository.update(id, { estado: 'activo' });
    
    // Actualizar en MongoDB también
    try {
      await this.mongoTouristPointModel.findOneAndUpdate(
        {
          $or: [
            { nombre: point.nombre, coordenadas: point.coordenadas },
            { lugar_destino: point.lugar_destino, nombre: point.nombre }
          ]
        },
        { $set: { estado: 'activo' } }
      );
    } catch (error) {
      this.logger.warn(`⚠️  Error al actualizar estado en MongoDB: ${error.message}`);
    }

    this.logger.log(`✅ Punto turístico aprobado: ${id} - ${point.nombre}`);
    return this.findOne(id);
  }

  async reject(id: number): Promise<TouristPoint> {
    const point = await this.findOne(id);
    
    if (point.estado !== 'pendiente_aprobacion') {
      throw new BadRequestException('El punto turístico no está pendiente de aprobación');
    }

    await this.touristPointRepository.update(id, { estado: 'inactivo' });
    
    // Actualizar en MongoDB también
    try {
      await this.mongoTouristPointModel.findOneAndUpdate(
        {
          $or: [
            { nombre: point.nombre, coordenadas: point.coordenadas },
            { lugar_destino: point.lugar_destino, nombre: point.nombre }
          ]
        },
        { $set: { estado: 'inactivo' } }
      );
    } catch (error) {
      this.logger.warn(`⚠️  Error al actualizar estado en MongoDB: ${error.message}`);
    }

    this.logger.log(`✅ Punto turístico rechazado: ${id} - ${point.nombre}`);
    return this.findOne(id);
  }

  async getPointsByCreator(creatorId: number) {
    return await this.touristPointRepository.find({
      where: { id_usuario_creador: creatorId },
      relations: ['creator'],
      order: { fecha_creacion: 'DESC' }
    });
  }

  async getPopularPoints(limit: number = 10) {
    try {
      // Obtener puntos más populares basados en número de reseñas
      const popularPoints = await this.mongoTouristPointModel
        .find({ estado: 'activo' })
        .sort({ 
          'reviews.length': -1, 
          calificacion_promedio: -1 
        })
        .limit(limit);

      return popularPoints;
    } catch (error) {
      this.logger.error(`❌ Error al obtener puntos populares: ${error.message}`);
      return [];
    }
  }

  async searchPoints(searchTerm: string, category?: string) {
    const queryBuilder = this.touristPointRepository
      .createQueryBuilder('point')
      .leftJoinAndSelect('point.creator', 'creator')
      .where('point.estado = :estado', { estado: 'activo' });

    if (searchTerm) {
      queryBuilder.andWhere(
        '(point.nombre LIKE :search OR point.lugar_destino LIKE :search OR point.descripcion LIKE :search)',
        { search: `%${searchTerm}%` }
      );
    }

    if (category) {
      queryBuilder.andWhere('point.categoria = :categoria', { categoria: category });
    }

    queryBuilder.orderBy('point.calificacion_promedio', 'DESC');

    return await queryBuilder.getMany();
  }
}
