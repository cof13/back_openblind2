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
import { CreateRouteDto } from './dto/create-rute.dto';
import { UpdateRouteDto } from './dto/update-rute.dto';
import { QueryRouteDto } from './dto/query-route.dto';
import { Route } from '../../models/mysql/route.entity';
import { User } from '../../models/mysql/user.entity';
import { RouteDetails } from '../../models/mongodb/route-details.schema';

@Injectable()
export class RouteService {
  private readonly logger = new Logger(RouteService.name);

  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectModel(RouteDetails.name)
    private readonly routeDetailsModel: Model<RouteDetails>,
  ) {}

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    // Verificar que el usuario creador existe si se proporciona
    if (createRouteDto.id_usuario_creador) {
      const user = await this.userRepository.findOne({
        where: { id_usuario: createRouteDto.id_usuario_creador, estado: 'activo' }
      });

      if (!user) {
        throw new BadRequestException(`El usuario con ID ${createRouteDto.id_usuario_creador} no existe o no está activo`);
      }
    }

    // Crear detalles en MongoDB primero
    let mongoDetailsId: string | undefined;
    try {
      const routeDetails = new this.routeDetailsModel({
        route_id: 0, // Se actualizará después
        ubicacion_ruta: createRouteDto.ubicacion_ruta,
        nombre_transporte: createRouteDto.nombre_transporte,
        descripcion: createRouteDto.descripcion || '',
        puntos_intermedios: createRouteDto.puntos_intermedios || [],
        horarios_servicio: createRouteDto.horarios_servicio || [],
        informacion_accesibilidad: createRouteDto.informacion_accesibilidad || {
          rampa_acceso: false,
          audio_informativo: false,
          señalizacion_braille: false,
          ascensor: false,
          piso_tactil: false,
          asientos_preferenciales: false
        },
        imagenes: [],
        metadatos: {
          total_usuarios: 0,
          calificacion_promedio: 0,
          comentarios_recientes: 0,
          popularidad_score: 0
        }
      });

      const savedDetails = await routeDetails.save();
      mongoDetailsId = savedDetails._id.toString();
      this.logger.log(`✅ Detalles de ruta creados en MongoDB: ${mongoDetailsId}`);
    } catch (error) {
      this.logger.warn(`⚠️  Error al crear detalles en MongoDB: ${error.message}`);
    }

    // Crear ruta en MySQL
    const routeData = {
      nombre_ruta: createRouteDto.nombre_ruta,
      ubicacion_ruta: createRouteDto.ubicacion_ruta,
      nombre_transporte: createRouteDto.nombre_transporte,
      coordenadas_inicio: createRouteDto.coordenadas_inicio,
      coordenadas_fin: createRouteDto.coordenadas_fin,
      distancia_km: createRouteDto.distancia_km,
      tiempo_estimado_min: createRouteDto.tiempo_estimado_min,
      id_usuario_creador: createRouteDto.id_usuario_creador,
      estado: createRouteDto.estado || 'activo' as const,
      details_mongo_id: mongoDetailsId,
    };

    const route = this.routeRepository.create(routeData);
    const savedRoute = await this.routeRepository.save(route);

    // Actualizar el route_id en MongoDB
    if (mongoDetailsId) {
      try {
        await this.routeDetailsModel.findByIdAndUpdate(
          mongoDetailsId,
          { route_id: savedRoute.id_ruta }
        );
      } catch (error) {
        this.logger.warn(`⚠️  Error al actualizar route_id en MongoDB: ${error.message}`);
      }
    }

    this.logger.log(`✅ Ruta creada: ${savedRoute.id_ruta}`);
    return this.findOne(savedRoute.id_ruta);
  }

  async findAll(queryDto?: QueryRouteDto) {
    const page = queryDto?.page || 1;
    const limit = queryDto?.limit || 10;
    const offset = (page - 1) * limit;

    const queryBuilder = this.routeRepository
      .createQueryBuilder('route')
      .leftJoinAndSelect('route.creator', 'creator')
      .leftJoinAndSelect('creator.role', 'role');

    // Aplicar filtros
    if (queryDto?.estado) {
      queryBuilder.andWhere('route.estado = :estado', { estado: queryDto.estado });
    }

    if (queryDto?.id_usuario_creador) {
      queryBuilder.andWhere('route.id_usuario_creador = :id_usuario_creador', { id_usuario_creador: queryDto.id_usuario_creador });
    }

    if (queryDto?.nombre_transporte) {
      queryBuilder.andWhere('route.nombre_transporte LIKE :nombre_transporte', { nombre_transporte: `%${queryDto.nombre_transporte}%` });
    }

    if (queryDto?.search) {
      queryBuilder.andWhere(
        '(route.nombre_ruta LIKE :search OR route.ubicacion_ruta LIKE :search OR route.nombre_transporte LIKE :search)',
        { search: `%${queryDto.search}%` }
      );
    }

    // Aplicar paginación y ordenamiento
    queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('route.fecha_creacion', 'DESC');

    const [routes, total] = await queryBuilder.getManyAndCount();

    return {
      data: routes,
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

  async findOne(id: number): Promise<Route> {
    const route = await this.routeRepository.findOne({
      where: { id_ruta: id },
      relations: ['creator', 'creator.role', 'messages', 'route_stations', 'route_stations.station']
    });

    if (!route) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }

    return route;
  }

  async findOneWithDetails(id: number) {
    const route = await this.findOne(id);
    
    let details = null;
    if (route.details_mongo_id) {
      try {
        details = await this.routeDetailsModel.findById(route.details_mongo_id);
      } catch (error) {
        this.logger.warn(`⚠️  Error al obtener detalles MongoDB: ${error.message}`);
      }
    }

    return {
      route,
      details
    };
  }

  async update(id: number, updateRouteDto: UpdateRouteDto): Promise<Route> {
    const route = await this.findOne(id);

    // Verificar usuario creador si se está actualizando
    if (updateRouteDto.id_usuario_creador && updateRouteDto.id_usuario_creador !== route.id_usuario_creador) {
      const user = await this.userRepository.findOne({
        where: { id_usuario: updateRouteDto.id_usuario_creador, estado: 'activo' }
      });

      if (!user) {
        throw new BadRequestException(`El usuario con ID ${updateRouteDto.id_usuario_creador} no existe o no está activo`);
      }
    }

    // Actualizar detalles en MongoDB si existe
    if (route.details_mongo_id) {
      try {
        await this.routeDetailsModel.findByIdAndUpdate(
          route.details_mongo_id,
          {
            $set: {
              ...(updateRouteDto.ubicacion_ruta && { ubicacion_ruta: updateRouteDto.ubicacion_ruta }),
              ...(updateRouteDto.nombre_transporte && { nombre_transporte: updateRouteDto.nombre_transporte }),
              ...(updateRouteDto.descripcion && { descripcion: updateRouteDto.descripcion }),
              ...(updateRouteDto.puntos_intermedios && { puntos_intermedios: updateRouteDto.puntos_intermedios }),
              ...(updateRouteDto.horarios_servicio && { horarios_servicio: updateRouteDto.horarios_servicio }),
              ...(updateRouteDto.informacion_accesibilidad && { informacion_accesibilidad: updateRouteDto.informacion_accesibilidad })
            }
          }
        );
      } catch (error) {
        this.logger.warn(`⚠️  Error al actualizar detalles MongoDB: ${error.message}`);
      }
    }

    // Actualizar ruta en MySQL
    await this.routeRepository.update(id, updateRouteDto);
    
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const route = await this.findOne(id);

    // Verificar que no tenga mensajes o estaciones asociadas
    if (route.messages && route.messages.length > 0) {
      throw new BadRequestException(`No se puede eliminar la ruta porque tiene ${route.messages.length} mensajes asociados`);
    }

    if (route.route_stations && route.route_stations.length > 0) {
      throw new BadRequestException(`No se puede eliminar la ruta porque tiene ${route.route_stations.length} estaciones asociadas`);
    }

    // Eliminar detalles de MongoDB si existe
    if (route.details_mongo_id) {
      try {
        await this.routeDetailsModel.findByIdAndDelete(route.details_mongo_id);
        this.logger.log(`✅ Detalles MongoDB eliminados: ${route.details_mongo_id}`);
      } catch (error) {
        this.logger.warn(`⚠️  Error al eliminar detalles MongoDB: ${error.message}`);
      }
    }

    // Eliminar ruta de MySQL
    await this.routeRepository.delete(id);
    this.logger.log(`✅ Ruta eliminada: ${id}`);
  }

  async findActiveRoutes() {
    return await this.routeRepository.find({
      where: { estado: 'activo' },
      relations: ['creator'],
      order: { fecha_creacion: 'DESC' }
    });
  }

  async findByTransportType(transportType: string) {
    return await this.routeRepository.find({
      where: { nombre_transporte: transportType, estado: 'activo' },
      relations: ['creator'],
      order: { nombre_ruta: 'ASC' }
    });
  }

  async getRouteStatistics() {
    const total = await this.routeRepository.count();
    const active = await this.routeRepository.count({ where: { estado: 'activo' } });
    const inactive = await this.routeRepository.count({ where: { estado: 'inactivo' } });
    const inReview = await this.routeRepository.count({ where: { estado: 'en_revision' } });
    
    const byTransport = await this.routeRepository
      .createQueryBuilder('route')
      .select('route.nombre_transporte', 'transporte')
      .addSelect('COUNT(*)', 'count')
      .groupBy('route.nombre_transporte')
      .getRawMany();

    return {
      total,
      active,
      inactive,
      inReview,
      byTransport
    };
  }

  async addStationToRoute(routeId: number, stationId: number, orden: number) {
    // Este método se implementaría en un servicio separado para RouteStation
    // Aquí solo se muestra la lógica básica
    const route = await this.findOne(routeId);
    
    // Verificar que la estación existe (implementar según sea necesario)
    // Crear relación RouteStation
    
    return { message: 'Estación agregada a la ruta exitosamente' };
  }
}