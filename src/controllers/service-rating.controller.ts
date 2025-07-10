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
import { ServiceRatingService } from '../services/service-rating.service';
import { CreateServiceRatingDto } from '../modules/service-rating/dto/create-service-rating.dto';
import { UpdateServiceRatingDto } from '../modules/service-rating/dto/update-service-rating.dto';
import { QueryServiceRatingDto } from '../modules/service-rating/dto/query-service-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../models/mysql/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Calificaciones de Servicios')
@Controller('service-ratings') // 🔗 RUTA BASE: '/service-ratings' - TODAS LAS RUTAS AGRUPADAS BAJO ESTA BASE
@UseInterceptors(ClassSerializerInterceptor)
export class ServiceRatingController {
  constructor(private readonly serviceRatingService: ServiceRatingService) {}

  // ========================================
  // 📝 OPERACIONES CRUD BÁSICAS - GRUPO 1: RUTAS ESTÁNDAR
  // ========================================

  /**
   * 🆕 CREAR - POST /service-ratings
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Guard específico JWT para esta ruta (no global)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard) // 🔐 SEPARACIÓN: Guard específico para esta ruta
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva calificación de servicio' })
  @ApiResponse({ status: 201, description: 'Calificación creada exitosamente' })
  async create(
    @Body() createRatingDto: CreateServiceRatingDto,
    @GetUser() user: User
  ) {
    createRatingDto.id_usuario_evaluador = user.id_usuario;
    return this.serviceRatingService.create(createRatingDto);
  }

  /**
   * 📋 LEER TODOS - GET /service-ratings
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Marcada como @Public() - acceso completamente público
   */
  @Get()
  @Public() // 🔓 SEPARACIÓN: Acceso público sin autenticación
  @ApiOperation({ summary: 'Obtener todas las calificaciones con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de calificaciones' })
  findAll(@Query() queryDto: QueryServiceRatingDto) {
    return this.serviceRatingService.findAll(queryDto);
  }

  // ========================================
  // 🔍 RUTAS ESPECIALIZADAS - GRUPO 2: CONSULTAS ESPECÍFICAS
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN ANTES de ':id' para evitar conflictos
  // ========================================

  /**
   * 📊 ESTADÍSTICAS - GET /service-ratings/statistics
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Guards específicos para administradores
   */
  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔐 SEPARACIÓN: Guards específicos para administradores
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de calificaciones' })
  @ApiResponse({ status: 200, description: 'Estadísticas de calificaciones' })
  getStatistics() {
    return this.serviceRatingService.getRatingStatistics();
  }

  /**
   * 🔧 SERVICIOS - GET /service-ratings/services
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: @Public() - acceso completamente público
   */
  @Get('services')
  @Public() // 🔓 SEPARACIÓN: Acceso público sin autenticación
  @ApiOperation({ summary: 'Obtener lista de servicios únicos' })
  @ApiResponse({ status: 200, description: 'Lista de servicios' })
  getServices() {
    return this.serviceRatingService.getUniqueServices();
  }

  /**
   * 📂 CATEGORÍAS - GET /service-ratings/categories
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: @Public() - acceso completamente público
   */
  @Get('categories')
  @Public() // 🔓 SEPARACIÓN: Acceso público sin autenticación
  @ApiOperation({ summary: 'Obtener lista de categorías únicas' })
  @ApiResponse({ status: 200, description: 'Lista de categorías' })
  getCategories() {
    return this.serviceRatingService.getUniqueCategories();
  }

  /**
   * 🔥 TRENDING - GET /service-ratings/trending
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: @Public() - acceso completamente público
   */
  @Get('trending')
  @Public() // 🔓 SEPARACIÓN: Acceso público sin autenticación
  @ApiOperation({ summary: 'Obtener servicios con mejores tendencias' })
  @ApiResponse({ status: 200, description: 'Servicios trending' })
  getTrendingServices() {
    return this.serviceRatingService.getTrendingServices();
  }

  // ========================================
  // 🔍 RUTAS CON PARÁMETROS ESPECÍFICOS - GRUPO 3: CONSULTAS CON PARÁMETROS
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN ANTES de ':id' para evitar conflictos
  // ========================================

  /**
   * 🔧 POR SERVICIO - GET /service-ratings/service/:serviceName
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: @Public() - acceso completamente público
   */
  @Get('service/:serviceName')
  @Public() // 🔓 SEPARACIÓN: Acceso público sin autenticación
  @ApiOperation({ summary: 'Obtener calificaciones por servicio específico' })
  @ApiResponse({ status: 200, description: 'Calificaciones del servicio' })
  findByService(@Param('serviceName') serviceName: string) {
    return this.serviceRatingService.findByService(serviceName);
  }

  /**
   * 📂 POR CATEGORÍA - GET /service-ratings/category/:categoryName
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: @Public() - acceso completamente público
   */
  @Get('category/:categoryName')
  @Public() // 🔓 SEPARACIÓN: Acceso público sin autenticación
  @ApiOperation({ summary: 'Obtener calificaciones por categoría' })
  @ApiResponse({ status: 200, description: 'Calificaciones de la categoría' })
  findByCategory(@Param('categoryName') categoryName: string) {
    return this.serviceRatingService.findByCategory(categoryName);
  }

  /**
   * 📊 PROMEDIO - GET /service-ratings/average/:serviceName
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: @Public() - acceso completamente público
   */
  @Get('average/:serviceName')
  @Public() // 🔓 SEPARACIÓN: Acceso público sin autenticación
  @ApiOperation({ summary: 'Obtener promedio de calificaciones de un servicio' })
  @ApiResponse({ status: 200, description: 'Promedio de calificaciones' })
  getServiceAverage(@Param('serviceName') serviceName: string) {
    return this.serviceRatingService.getServiceAverage(serviceName);
  }

  /**
   * 📅 REPORTE MENSUAL - GET /service-ratings/monthly-report/:year
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Guards específicos para administradores
   */
  @Get('monthly-report/:year')
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔐 SEPARACIÓN: Guards específicos para administradores
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener reporte mensual de calificaciones' })
  @ApiResponse({ status: 200, description: 'Reporte mensual' })
  getMonthlyReport(@Param('year', ParseIntPipe) year: number) {
    return this.serviceRatingService.getMonthlyReport(year);
  }

  // ========================================
  // 🔍 RUTAS CON PARÁMETROS ID - GRUPO 4: OPERACIONES POR ID
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN DESPUÉS de todas las rutas específicas
  // ========================================

  /**
   * 🔍 LEER UNO - GET /service-ratings/:id
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: @Public() - acceso completamente público
   */
  @Get(':id')
  @Public() // 🔓 SEPARACIÓN: Acceso público sin autenticación
  @ApiOperation({ summary: 'Obtener calificación por ID' })
  @ApiResponse({ status: 200, description: 'Calificación encontrada' })
  @ApiResponse({ status: 404, description: 'Calificación no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceRatingService.findOne(id);
  }

  /**
   * 🔎 DETALLES COMPLETOS - GET /service-ratings/:id/details
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: @Public() - acceso completamente público
   */
  @Get(':id/details')
  @Public() // 🔓 SEPARACIÓN: Acceso público sin autenticación
  @ApiOperation({ summary: 'Obtener calificación con detalles completos (MongoDB)' })
  @ApiResponse({ status: 200, description: 'Calificación con detalles completos' })
  findOneWithDetails(@Param('id', ParseIntPipe) id: number) {
    return this.serviceRatingService.findOneWithDetails(id);
  }

  /**
   * ✏️ ACTUALIZAR - PATCH /service-ratings/:id
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Guard específico JWT para esta ruta
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard) // 🔐 SEPARACIÓN: Guard específico para esta ruta
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar calificación (solo el evaluador o admin)' })
  @ApiResponse({ status: 200, description: 'Calificación actualizada exitosamente' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateRatingDto: UpdateServiceRatingDto,
    @GetUser() user: User
  ) {
    return this.serviceRatingService.update(id, updateRatingDto, user.id_usuario);
  }

  /**
   * 🗑️ ELIMINAR - DELETE /service-ratings/:id
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Guards específicos para administradores
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔐 SEPARACIÓN: Guards específicos para administradores
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar calificación' })
  @ApiResponse({ status: 204, description: 'Calificación eliminada exitosamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviceRatingService.remove(id);
  }
}
