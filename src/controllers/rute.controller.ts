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
import { RouteService } from '../services/rute.service';
import { CreateRouteDto } from '../modules/rute/dto/create-rute.dto';
import { UpdateRouteDto } from '../modules/rute/dto/update-rute.dto';
import { QueryRouteDto } from '../modules/rute/dto/query-route.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser  } from '../auth/decorators/get-user.decorator';
import { User } from '../models/mysql/user.entity';

@ApiTags('Rutas de Transporte')
@Controller('routes') // 🔗 RUTA BASE: '/routes' - TODAS LAS RUTAS AGRUPADAS BAJO ESTA BASE
@UseGuards(JwtAuthGuard) // 🔐 AUTENTICACIÓN: Aplica a todas las rutas - AGRUPACIÓN GLOBAL DE SEGURIDAD
@UseInterceptors(ClassSerializerInterceptor)
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  // ========================================
  // 📝 OPERACIONES CRUD BÁSICAS - GRUPO 1: RUTAS ESTÁNDAR
  // ========================================

  /**
   * 🆕 CREAR - POST /routes
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Tiene su propio guard adicional para roles específicos
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard adicional específico para esta ruta
  @Roles('Super Administrador', 'Administrador', 'Editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva ruta de transporte' })
  @ApiResponse({ status: 201, description: 'Ruta creada exitosamente' })
  async create(
    @Body() createRouteDto: CreateRouteDto,
    @GetUser () user: User
  ) {
    createRouteDto.id_usuario_creador = user.id_usuario;
    return this.routeService.create(createRouteDto);
  }

  /**
   * 📋 LEER TODOS - GET /routes
   * AGRUPADA: Solo usa la autenticación JWT del controlador
   * SEPARADA: Sin guards adicionales - acceso público (solo JWT)
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las rutas con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de rutas' })
  findAll(@Query() queryDto: QueryRouteDto) {
    return this.routeService.findAll(queryDto);
  }

  // ========================================
  // 🔍 RUTAS ESPECIALIZADAS - GRUPO 2: CONSULTAS ESPECÍFICAS
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN ANTES de ':id' para evitar conflictos
  // ========================================

  /**
   * ✅ RUTAS ACTIVAS - GET /routes/active
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Ruta específica que debe ir antes de ':id'
   */
  @Get('active')
  @ApiOperation({ summary: 'Obtener solo rutas activas' })
  @ApiResponse({ status: 200, description: 'Lista de rutas activas' })
  findActiveRoutes() {
    return this.routeService.findActiveRoutes();
  }

  /**
   * 📊 ESTADÍSTICAS - GET /routes/statistics
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional para roles administrativos
   */
  @Get('statistics')
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para administradores
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de rutas' })
  @ApiResponse({ status: 200, description: 'Estadísticas de rutas' })
  getStatistics() {
    return this.routeService.getRouteStatistics();
  }

  /**
   * 🚌 RUTAS POR TRANSPORTE - GET /routes/transport/:transportType
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Ruta específica con parámetro propio
   */
  @Get('transport/:transportType')
  @ApiOperation({ summary: 'Obtener rutas por tipo de transporte' })
  @ApiResponse({ status: 200, description: 'Rutas del tipo de transporte especificado' })
  findByTransportType(@Param('transportType') transportType: string) {
    return this.routeService.findByTransportType(transportType);
  }

  // ========================================
  // 🔍 RUTAS CON PARÁMETROS - GRUPO 3: OPERACIONES POR ID
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN DESPUÉS de rutas específicas
  // ========================================

  /**
   * 🔍 LEER UNO - GET /routes/:id
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Colocada después de rutas específicas para evitar conflictos
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener ruta por ID' })
  @ApiResponse({ status: 200, description: 'Ruta encontrada' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.routeService.findOne(id);
  }

  /**
   * 🔎 DETALLES COMPLETOS - GET /routes/:id/details
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Extiende la ruta ':id' con funcionalidad adicional
   */
  @Get(':id/details')
  @ApiOperation({ summary: 'Obtener detalles de la ruta por ID' })
  @ApiResponse({ status: 200, description: 'Detalles de la ruta encontrados' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  findOneWithDetails(@Param('id', ParseIntPipe) id: number) {
    return this.routeService.findOneWithDetails(id);
  }

  /**
   * ✏️ ACTUALIZAR - PATCH /routes/:id
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional específico para roles de edición
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para editores
  @Roles('Super Administrador', 'Administrador', 'Editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar ruta por ID' })
  @ApiResponse({ status: 200, description: 'Ruta actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRouteDto: UpdateRouteDto) {
    return this.routeService.update(id, updateRouteDto);
  }

  /**
   * 🗑️ ELIMINAR - DELETE /routes/:id
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional específico para roles administrativos
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para administradores
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar ruta por ID' })
  @ApiResponse({ status: 204, description: 'Ruta eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.routeService.remove(id);
  }
}
