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
  ParseFloatPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StationService } from '../services/station.service';
import { CreateStationDto } from '../modules/station/dto/create-station.dto';
import { UpdateStationDto } from '../modules/station/dto/update-station.dto';
import { QueryStationDto } from '../modules/station/dto/query-station.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Estaciones de Transporte')
@Controller('stations') // 🔗 RUTA BASE: '/stations' - TODAS LAS RUTAS AGRUPADAS BAJO ESTA BASE
@UseGuards(JwtAuthGuard) // 🔐 AUTENTICACIÓN: Aplica a todas las rutas - AGRUPACIÓN GLOBAL DE SEGURIDAD
@UseInterceptors(ClassSerializerInterceptor)
export class StationController {
  constructor(private readonly stationService: StationService) {}

  // ========================================
  // 📝 OPERACIONES CRUD BÁSICAS - GRUPO 1: RUTAS ESTÁNDAR
  // ========================================

  /**
   * 🆕 CREAR - POST /stations
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Tiene su propio guard adicional para roles específicos
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard adicional específico para esta ruta
  @Roles('Super Administrador', 'Administrador', 'Editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva estación' })
  @ApiResponse({ status: 201, description: 'Estación creada exitosamente' })
  create(@Body() createStationDto: CreateStationDto) {
    return this.stationService.create(createStationDto);
  }

  /**
   * 📋 LEER TODOS - GET /stations
   * AGRUPADA: Solo usa la autenticación JWT del controlador
   * SEPARADA: Sin guards adicionales - acceso público (solo JWT)
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las estaciones con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de estaciones' })
  findAll(@Query() queryDto: QueryStationDto) {
    return this.stationService.findAll(queryDto);
  }

  // ========================================
  // 🔍 RUTAS ESPECIALIZADAS - GRUPO 2: CONSULTAS ESPECÍFICAS
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN ANTES de ':id' para evitar conflictos
  // ========================================

  /**
   * ✅ ESTACIONES OPERATIVAS - GET /stations/operational
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Ruta específica que debe ir antes de ':id'
   */
  @Get('operational')
  @ApiOperation({ summary: 'Obtener solo estaciones operativas' })
  @ApiResponse({ status: 200, description: 'Lista de estaciones operativas' })
  findOperationalStations() {
    return this.stationService.findOperationalStations();
  }

  /**
   * 📊 ESTADÍSTICAS - GET /stations/statistics
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional para roles administrativos
   */
  @Get('statistics')
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para administradores
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de estaciones' })
  @ApiResponse({ status: 200, description: 'Estadísticas de estaciones' })
  getStatistics() {
    return this.stationService.getStationStatistics();
  }

  // ========================================
  // 🔍 RUTAS CON PARÁMETROS ESPECÍFICOS - GRUPO 3: CONSULTAS CON PARÁMETROS
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN ANTES de ':id' para evitar conflictos
  // ========================================

  /**
   * 🚌 POR TIPO DE TRANSPORTE - GET /stations/transport/:transportType
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Ruta específica con parámetro propio
   */
  @Get('transport/:transportType')
  @ApiOperation({ summary: 'Obtener estaciones por tipo de transporte' })
  @ApiResponse({ status: 200, description: 'Estaciones del tipo de transporte especificado' })
  findByTransportType(@Param('transportType') transportType: 'metro' | 'bus' | 'trolebus' | 'ecovia') {
    return this.stationService.findByTransportType(transportType);
  }

  /**
   * 📍 ESTACIONES CERCANAS - GET /stations/nearby/:lat/:lng
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Ruta específica con múltiples parámetros de coordenadas
   */
  @Get('nearby/:lat/:lng')
  @ApiOperation({ summary: 'Obtener estaciones cercanas a una ubicación' })
  @ApiResponse({ status: 200, description: 'Estaciones cercanas' })
  findNearby(
    @Param('lat', ParseFloatPipe) lat: number,
    @Param('lng', ParseFloatPipe) lng: number,
    @Query('radius', ParseFloatPipe) radius?: number
  ) {
    return this.stationService.findNearby(lat, lng, radius);
  }

  // ========================================
  // 🔍 RUTAS CON PARÁMETROS ID - GRUPO 4: OPERACIONES POR ID
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN DESPUÉS de todas las rutas específicas
  // ========================================

  /**
   * 🔍 LEER UNO - GET /stations/:id
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Colocada después de rutas específicas para evitar conflictos
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener estación por ID' })
  @ApiResponse({ status: 200, description: 'Estación encontrada' })
  @ApiResponse({ status: 404, description: 'Estación no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stationService.findOne(id);
  }

  /**
   * 🔎 DETALLES COMPLETOS - GET /stations/:id/details
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Extiende la ruta ':id' con funcionalidad adicional
   */
  @Get(':id/details')
  @ApiOperation({ summary: 'Obtener estación con detalles completos (MongoDB)' })
  @ApiResponse({ status: 200, description: 'Estación con detalles completos' })
  findOneWithDetails(@Param('id', ParseIntPipe) id: number) {
    return this.stationService.findOneWithDetails(id);
  }

  /**
   * ✏️ ACTUALIZAR - PATCH /stations/:id
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional específico para roles de edición
   */
  @Patch(':id')
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para editores
  @Roles('Super Administrador', 'Administrador', 'Editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar estación' })
  @ApiResponse({ status: 200, description: 'Estación actualizada exitosamente' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateStationDto: UpdateStationDto
  ) {
    return this.stationService.update(id, updateStationDto);
  }

  /**
   * 🗑️ ELIMINAR - DELETE /stations/:id
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional específico para roles administrativos
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para administradores
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar estación' })
  @ApiResponse({ status: 204, description: 'Estación eliminada exitosamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stationService.remove(id);
  }
}