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
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { QueryStationDto } from './dto/query-station.dto';
import { CreateStationScheduleDto } from './dto/create-station-schedule.dto';
import { UpdateStationScheduleDto } from './dto/update-station-schedule.dto';
import { Station } from '../../models/mysql/station.entity';
import { StationSchedule } from '../../models/mysql/station-schedule.entity';
import { StationDetails } from '../../models/mongodb/station-details.schema';

@Injectable()
export class StationService {
  private readonly logger = new Logger(StationService.name);

  constructor(
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
    @InjectRepository(StationSchedule)
    private readonly stationScheduleRepository: Repository<StationSchedule>,
    @InjectModel(StationDetails.name)
    private readonly stationDetailsModel: Model<StationDetails>,
  ) {}

  async create(createStationDto: CreateStationDto): Promise<Station> {
    // Verificar que no existe una estación con las mismas coordenadas exactas
    const existingStation = await this.stationRepository.findOne({
      where: { coordenadas: createStationDto.coordenadas }
    });

    if (existingStation) {
      throw new BadRequestException(`Ya existe una estación en las coordenadas ${createStationDto.coordenadas}`);
    }

    // Verificar que no existe una estación con el mismo nombre y tipo de transporte
    const existingNameStation = await this.stationRepository.findOne({
      where: { 
        nombre_estacion: createStationDto.nombre_estacion,
        tipo_transporte: createStationDto.tipo_transporte
      }
    });

    if (existingNameStation) {
      throw new BadRequestException(`Ya existe una estación ${createStationDto.tipo_transporte} con el nombre "${createStationDto.nombre_estacion}"`);
    }

    // Crear detalles en MongoDB primero
    let mongoDetailsId: string | undefined;
    try {
      const stationDetails = new this.stationDetailsModel({
        station_id: 0, // Se actualizará después
        direccion: createStationDto.direccion || '',
        imagen_url: createStationDto.imagen_url || '',
        servicios: createStationDto.servicios || {
          wifi_gratuito: false,
          baños: false,
          ascensor: false,
          escaleras_electricas: false,
          estacionamiento: false,
          comercios: []
        },
        accesibilidad: createStationDto.accesibilidad || {
          rampa_acceso: false,
          señalizacion_braille: false,
          audio_informativo: false,
          piso_tactil: false,
          asientos_preferenciales: false
        },
        horarios_operacion: createStationDto.horarios_operacion || {
          lunes_viernes: { apertura: '05:00', cierre: '23:00' },
          sabados: { apertura: '06:00', cierre: '22:00' },
          domingos: { apertura: '07:00', cierre: '21:00' }
        }
      });

      const savedDetails = await stationDetails.save();
      mongoDetailsId = savedDetails._id.toString();
      this.logger.log(`✅ Detalles de estación creados en MongoDB: ${mongoDetailsId}`);
    } catch (error) {
      this.logger.warn(`⚠️  Error al crear detalles en MongoDB: ${error.message}`);
    }

    // Crear estación en MySQL
    const stationData = {
      nombre_estacion: createStationDto.nombre_estacion,
      tipo_transporte: createStationDto.tipo_transporte,
      coordenadas: createStationDto.coordenadas,
      direccion: createStationDto.direccion,
      estado_operativo: createStationDto.estado_operativo || 'operativa' as const,
      imagen_url: createStationDto.imagen_url,
      fecha_inauguracion: createStationDto.fecha_inauguracion ? new Date(createStationDto.fecha_inauguracion) : undefined,
      details_mongo_id: mongoDetailsId,
    };

    const station = this.stationRepository.create(stationData);
    const savedStation = await this.stationRepository.save(station);

    // Actualizar el station_id en MongoDB
    if (mongoDetailsId) {
      try {
        await this.stationDetailsModel.findByIdAndUpdate(
          mongoDetailsId,
          { station_id: savedStation.id_estacion }
        );
      } catch (error) {
        this.logger.warn(`⚠️  Error al actualizar station_id en MongoDB: ${error.message}`);
      }
    }

    this.logger.log(`✅ Estación creada: ${savedStation.id_estacion} - ${savedStation.nombre_estacion}`);
    return this.findOne(savedStation.id_estacion);
  }

  async findAll(queryDto?: QueryStationDto) {
    const page = queryDto?.page || 1;
    const limit = queryDto?.limit || 10;
    const offset = (page - 1) * limit;

    const queryBuilder = this.stationRepository
      .createQueryBuilder('station')
      .leftJoinAndSelect('station.route_stations', 'route_stations')
      .leftJoinAndSelect('route_stations.route', 'route');

    // Aplicar filtros
    if (queryDto?.estado_operativo) {
      queryBuilder.andWhere('station.estado_operativo = :estado_operativo', { 
        estado_operativo: queryDto.estado_operativo 
      });
    }

    if (queryDto?.tipo_transporte) {
      queryBuilder.andWhere('station.tipo_transporte = :tipo_transporte', { 
        tipo_transporte: queryDto.tipo_transporte 
      });
    }

    if (queryDto?.search) {
      queryBuilder.andWhere(
        '(station.nombre_estacion LIKE :search OR station.direccion LIKE :search)',
        { search: `%${queryDto.search}%` }
      );
    }

    // Filtro por proximidad si se proporcionan coordenadas
    if (queryDto?.lat && queryDto?.lng) {
      const lat = parseFloat(queryDto.lat);
      const lng = parseFloat(queryDto.lng);
      const radius = queryDto.radius ? parseFloat(queryDto.radius) : 5; // 5km por defecto

      // Usar función de distancia MySQL (aproximada)
      queryBuilder.andWhere(
        `(
          6371 * acos(
            cos(radians(:lat)) * 
            cos(radians(SUBSTRING_INDEX(station.coordenadas, ',', 1))) * 
            cos(radians(SUBSTRING_INDEX(station.coordenadas, ',', -1)) - radians(:lng)) + 
            sin(radians(:lat)) * 
            sin(radians(SUBSTRING_INDEX(station.coordenadas, ',', 1)))
          )
        ) <= :radius`,
        { lat, lng, radius }
      );
    }

    // Aplicar paginación y ordenamiento
    queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('station.nombre_estacion', 'ASC');

    const [stations, total] = await queryBuilder.getManyAndCount();

    return {
      data: stations,
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

  async findOne(id: number): Promise<Station> {
    const station = await this.stationRepository.findOne({
      where: { id_estacion: id },
      relations: [
        'route_stations', 
        'route_stations.route', 
        'schedules'
      ]
    });

    if (!station) {
      throw new NotFoundException(`Estación con ID ${id} no encontrada`);
    }

    return station;
  }

  async findOneWithDetails(id: number) {
    const station = await this.findOne(id);
    
    let details = null;
    if (station.details_mongo_id) {
      try {
        details = await this.stationDetailsModel.findById(station.details_mongo_id);
      } catch (error) {
        this.logger.warn(`⚠️  Error al obtener detalles MongoDB: ${error.message}`);
      }
    }

    return {
      station,
      details,
      totalRoutes: station.route_stations?.length || 0,
      totalSchedules: station.schedules?.length || 0
    };
  }

  async update(id: number, updateStationDto: UpdateStationDto): Promise<Station> {
    const station = await this.findOne(id);

    // Verificar coordenadas únicas si se están actualizando
    if (updateStationDto.coordenadas && updateStationDto.coordenadas !== station.coordenadas) {
      const existingStation = await this.stationRepository.findOne({
        where: { coordenadas: updateStationDto.coordenadas }
      });

      if (existingStation && existingStation.id_estacion !== id) {
        throw new BadRequestException(`Ya existe una estación en las coordenadas ${updateStationDto.coordenadas}`);
      }
    }

    // Verificar nombre único si se está actualizando
    if (updateStationDto.nombre_estacion && 
        (updateStationDto.nombre_estacion !== station.nombre_estacion || 
         updateStationDto.tipo_transporte !== station.tipo_transporte)) {
      
      const tipo = updateStationDto.tipo_transporte || station.tipo_transporte;
      const existingNameStation = await this.stationRepository.findOne({
        where: { 
          nombre_estacion: updateStationDto.nombre_estacion,
          tipo_transporte: tipo
        }
      });

      if (existingNameStation && existingNameStation.id_estacion !== id) {
        throw new BadRequestException(`Ya existe una estación ${tipo} con el nombre "${updateStationDto.nombre_estacion}"`);
      }
    }

    // Actualizar detalles en MongoDB si existe
    if (station.details_mongo_id) {
      try {
        const updateFields: any = {};
        
        if (updateStationDto.direccion) updateFields.direccion = updateStationDto.direccion;
        if (updateStationDto.imagen_url !== undefined) updateFields.imagen_url = updateStationDto.imagen_url;
        if (updateStationDto.servicios) updateFields.servicios = updateStationDto.servicios;
        if (updateStationDto.accesibilidad) updateFields.accesibilidad = updateStationDto.accesibilidad;
        if (updateStationDto.horarios_operacion) updateFields.horarios_operacion = updateStationDto.horarios_operacion;

        if (Object.keys(updateFields).length > 0) {
          await this.stationDetailsModel.findByIdAndUpdate(
            station.details_mongo_id,
            { $set: updateFields }
          );
        }
      } catch (error) {
        this.logger.warn(`⚠️  Error al actualizar detalles MongoDB: ${error.message}`);
      }
    }

    // Actualizar estación en MySQL
    const updateData: Partial<Station> = {};
    
    if (updateStationDto.nombre_estacion) updateData.nombre_estacion = updateStationDto.nombre_estacion;
    if (updateStationDto.tipo_transporte) updateData.tipo_transporte = updateStationDto.tipo_transporte;
    if (updateStationDto.coordenadas) updateData.coordenadas = updateStationDto.coordenadas;
    if (updateStationDto.direccion) updateData.direccion = updateStationDto.direccion;
    if (updateStationDto.estado_operativo) updateData.estado_operativo = updateStationDto.estado_operativo;
    if (updateStationDto.imagen_url !== undefined) updateData.imagen_url = updateStationDto.imagen_url;
    if (updateStationDto.fecha_inauguracion) {
      updateData.fecha_inauguracion = new Date(updateStationDto.fecha_inauguracion);
    }

    if (Object.keys(updateData).length > 0) {
      await this.stationRepository.update(id, updateData);
    }
    
    this.logger.log(`✅ Estación actualizada: ${id}`);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const station = await this.findOne(id);

    // Verificar que no tenga rutas asociadas
    if (station.route_stations && station.route_stations.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la estación porque tiene ${station.route_stations.length} rutas asociadas. ` +
        `Primero debe eliminar las asociaciones con las rutas.`
      );
    }

    // Verificar que no tenga horarios asociados
    if (station.schedules && station.schedules.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la estación porque tiene ${station.schedules.length} horarios asociados. ` +
        `Primero debe eliminar los horarios.`
      );
    }

    // Eliminar detalles de MongoDB si existe
    if (station.details_mongo_id) {
      try {
        await this.stationDetailsModel.findByIdAndDelete(station.details_mongo_id);
        this.logger.log(`✅ Detalles MongoDB eliminados: ${station.details_mongo_id}`);
      } catch (error) {
        this.logger.warn(`⚠️  Error al eliminar detalles MongoDB: ${error.message}`);
      }
    }

    // Eliminar estación de MySQL
    await this.stationRepository.delete(id);
    this.logger.log(`✅ Estación eliminada: ${id} - ${station.nombre_estacion}`);
  }

  async findOperationalStations() {
    return await this.stationRepository.find({
      where: { estado_operativo: 'operativa' },
      relations: ['route_stations', 'route_stations.route'],
      order: { nombre_estacion: 'ASC' }
    });
  }

  async findByTransportType(transportType: 'metro' | 'bus' | 'trolebus' | 'ecovia') {
    return await this.stationRepository.find({
      where: { 
        tipo_transporte: transportType, 
        estado_operativo: 'operativa' 
      },
      relations: ['route_stations', 'route_stations.route'],
      order: { nombre_estacion: 'ASC' }
    });
  }

  async findNearby(lat: number, lng: number, radius: number = 1) {
    // Implementar búsqueda por proximidad usando coordenadas
    const stations = await this.stationRepository.find({
      where: { estado_operativo: 'operativa' },
      relations: ['route_stations', 'route_stations.route']
    });

    const nearbyStations = stations.filter(station => {
      try {
        const [stationLat, stationLng] = station.coordenadas.split(',').map(coord => parseFloat(coord.trim()));
        
        if (isNaN(stationLat) || isNaN(stationLng)) {
          this.logger.warn(`Coordenadas inválidas para estación ${station.id_estacion}: ${station.coordenadas}`);
          return false;
        }
        
        const distance = this.calculateDistance(lat, lng, stationLat, stationLng);
        return distance <= radius;
      } catch (error) {
        this.logger.warn(`Error procesando coordenadas de estación ${station.id_estacion}: ${error.message}`);
        return false;
      }
    });

    // Ordenar por distancia
    return nearbyStations
      .map(station => {
        const [stationLat, stationLng] = station.coordenadas.split(',').map(coord => parseFloat(coord.trim()));
        const distance = this.calculateDistance(lat, lng, stationLat, stationLng);
        return { ...station, distance };
      })
      .sort((a, b) => a.distance - b.distance);
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

  async getStationStatistics() {
    const total = await this.stationRepository.count();
    const operational = await this.stationRepository.count({ where: { estado_operativo: 'operativa' } });
    const maintenance = await this.stationRepository.count({ where: { estado_operativo: 'mantenimiento' } });
    const closed = await this.stationRepository.count({ where: { estado_operativo: 'cerrada' } });
    
    const byTransport = await this.stationRepository
      .createQueryBuilder('station')
      .select('station.tipo_transporte', 'tipo')
      .addSelect('COUNT(*)', 'count')
      .groupBy('station.tipo_transporte')
      .getRawMany();

    const withRoutes = await this.stationRepository
      .createQueryBuilder('station')
      .leftJoin('station.route_stations', 'route_station')
      .where('route_station.id_ruta IS NOT NULL')
      .getCount();

    return {
      total,
      operational,
      maintenance,
      closed,
      withRoutes,
      withoutRoutes: total - withRoutes,
      byTransport
    };
  }

  // Métodos para manejar horarios de estación
  async createSchedule(createScheduleDto: CreateStationScheduleDto): Promise<StationSchedule> {
    // Verificar que la estación existe
    const station = await this.findOne(createScheduleDto.id_estacion);

    // Verificar que no existe un horario igual para el mismo día
    const existingSchedule = await this.stationScheduleRepository.findOne({
      where: {
        id_estacion: createScheduleDto.id_estacion,
        dia_semana: createScheduleDto.dia_semana,
        hora_llegada: createScheduleDto.hora_llegada,
        fecha_especifica: createScheduleDto.fecha_especifica ? new Date(createScheduleDto.fecha_especifica) : undefined
      }
    });

    if (existingSchedule) {
      throw new BadRequestException(`Ya existe un horario para ${createScheduleDto.dia_semana} a las ${createScheduleDto.hora_llegada} en esta estación`);
    }

    const scheduleData = {
      id_estacion: createScheduleDto.id_estacion,
      dia_semana: createScheduleDto.dia_semana,
      hora_llegada: createScheduleDto.hora_llegada,
      servicio: createScheduleDto.servicio,
      frecuencia_minutos: createScheduleDto.frecuencia_minutos,
      fecha_especifica: createScheduleDto.fecha_especifica ? new Date(createScheduleDto.fecha_especifica) : undefined,
      activo: createScheduleDto.activo ?? true,
    };

    const schedule = this.stationScheduleRepository.create(scheduleData);
    const savedSchedule = await this.stationScheduleRepository.save(schedule);

    this.logger.log(`✅ Horario creado para estación ${createScheduleDto.id_estacion}: ${createScheduleDto.dia_semana} ${createScheduleDto.hora_llegada}`);
    return savedSchedule;
  }

  async findSchedulesByStation(stationId: number) {
    await this.findOne(stationId); // Verificar que la estación existe

    return await this.stationScheduleRepository.find({
      where: { id_estacion: stationId, activo: true },
      order: { 
        dia_semana: 'ASC', 
        hora_llegada: 'ASC' 
      }
    });
  }

  async findSchedulesByDay(stationId: number, dayOfWeek: string) {
    await this.findOne(stationId); // Verificar que la estación existe

    return await this.stationScheduleRepository.find({
      where: { 
        id_estacion: stationId, 
        dia_semana: dayOfWeek as any,
        activo: true 
      },
      order: { hora_llegada: 'ASC' }
    });
  }

 async updateSchedule(scheduleId: number, updateScheduleDto: UpdateStationScheduleDto): Promise<StationSchedule> {
  const schedule = await this.stationScheduleRepository.findOne({
    where: { id_horario: scheduleId }
  });

  if (!schedule) {
    throw new NotFoundException(`Horario con ID ${scheduleId} no encontrado`);
  }

  // Si se está actualizando la estación, verificar que existe
  if (updateScheduleDto.id_estacion && updateScheduleDto.id_estacion !== schedule.id_estacion) {
    await this.findOne(updateScheduleDto.id_estacion);
  }

  await this.stationScheduleRepository.update(scheduleId, updateScheduleDto);
  
  const updatedSchedule = await this.stationScheduleRepository.findOne({
    where: { id_horario: scheduleId }
  });

  return updatedSchedule ?? schedule;
}


  async removeSchedule(scheduleId: number): Promise<void> {
    const schedule = await this.stationScheduleRepository.findOne({
      where: { id_horario: scheduleId }
    });

    if (!schedule) {
      throw new NotFoundException(`Horario con ID ${scheduleId} no encontrado`);
    }

    await this.stationScheduleRepository.delete(scheduleId);
    this.logger.log(`✅ Horario eliminado: ${scheduleId}`);
  }

  async getNextArrivals(stationId: number, limit: number = 5) {
    await this.findOne(stationId); // Verificar que la estación existe

    const now = new Date();
    const currentDay = now.toLocaleDateString('es-EC', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    // Mapear días en español a los valores de la base de datos
    const dayMapping = {
      'lunes': 'lunes',
      'martes': 'martes', 
      'miércoles': 'miercoles',
      'jueves': 'jueves',
      'viernes': 'viernes',
      'sábado': 'sabado',
      'domingo': 'domingo'
    };

    const dbDay = dayMapping[currentDay] || currentDay;

    const upcomingSchedules = await this.stationScheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.id_estacion = :stationId', { stationId })
      .andWhere('schedule.activo = true')
      .andWhere('schedule.dia_semana = :day', { day: dbDay })
      .andWhere('schedule.hora_llegada > :currentTime', { currentTime })
      .orderBy('schedule.hora_llegada', 'ASC')
      .limit(limit)
      .getMany();

    return upcomingSchedules;
  }
}