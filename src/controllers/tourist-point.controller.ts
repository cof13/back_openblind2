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
import { TouristPointService } from '../services/tourist-point.service';
import { CreateTouristPointDto } from '../modules/tourist-point/dto/create-tourist-point.dto';
import { UpdateTouristPointDto } from '../modules/tourist-point/dto/update-tourist-point.dto';
import { QueryTouristPointDto } from '../modules/tourist-point/dto/query-tourist-point.dto';
import { AddReviewDto } from '../modules/tourist-point/dto/add-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../models/mysql/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Puntos Turísticos')
@Controller('tourist-points') // 🔗 RUTA BASE: '/tourist-points' - TODAS LAS RUTAS AGRUPADAS BAJO ESTA BASE
@UseInterceptors(ClassSerializerInterceptor)
export class TouristPointController {
  constructor(private readonly touristPointService: TouristPointService) {}

  // ========================================
  // 📝 OPERACIONES CRUD BÁSICAS - GRUPO 1: RUTAS ESTÁNDAR
  // ========================================

  /**
   * 🆕 CREAR - POST /tourist-points
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Guards específicos JWT + RolesGuard para usuarios registrados
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔐 SEPARACIÓN: Guards específicos para usuarios registrados
  @Roles('Super Administrador', 'Administrador', 'Editor', 'Usuario Premium', 'Usuario Estándar')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nuevo punto turístico' })
  @ApiResponse({ status: 201, description: 'Punto turístico creado exitosamente' })
  async create(
    @Body() createTouristPointDto: CreateTouristPointDto,
    @GetUser() user: User
  ) {
    createTouristPointDto.id_usuario_creador = user.id_usuario;
    return this.touristPointService.create(createTouristPointDto);
  }

  /**
   * 📋 LEER TODOS - GET /tourist-points
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: @Public() - acceso completamente público
   */
  @Get()
  @Public() // 🔓 SEPARACIÓN: Acceso público sin autenticación
  @ApiOperation({ summary: 'Obtener todos los puntos turísticos con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de puntos turísticos' })
  findAll(@Query() queryDto: QueryTouristPointDto) {
    return this.touristPointService.findAll(queryDto);
  }

  // ========================================
  // 🔍 RUTAS ESPECIALIZADAS - GRUPO 2: CONSULTAS ESPECÍFICAS
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN ANTES de ':id' para evitar conflictos
  // ========================================

  /**
   * ✅ PUNTOS ACTIVOS - GET /tourist-points/active
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: @Public() - acceso completamente público
   */
  @Get('active')
  @Public() // 🔓 SEPARACIÓN: Acceso público sin autenticación
  @ApiOperation({ summary: 'Obtener solo puntos turísticos activos' })
  @ApiResponse({ status: 200, description: 'Lista de puntos turísticos activos' })
  findActivePoints() {
    return this.touristPointService.findActivePoints();
  }

  /**
   * 📊 ESTADÍSTICAS - GET /tourist-points/statistics
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Guards específicos para administradores
   */
  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔐 SEPARACIÓN: Guards específicos para administradores
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de puntos turísticos' })
  @ApiResponse({ status: 200, description: 'Estadísticas de puntos turísticos' })
  getStatistics() {
    return this.touristPointService.getTouristPointStatistics();
  }

  /**
   * ⭐ MEJOR CALIFICADOS - GET /tourist-points/top-rated
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: @Public() - acceso completamente público
   */
  @Get('top-rated')
  @Public() // 🔓 SEPARACIÓN: Acceso público sin autenticación
  @ApiOperation({ summary: 'Obtener puntos turísticos mejor calificados' })
  @ApiResponse({ status: 200, description: 'Puntos turísticos mejor calificados' })
  findTopRated(@Query('limit', ParseIntPipe) limit?: number) {
    return this.touristPointService.findTopRated(limit);
  }

  /**
   * 🔍 BÚSQUEDA - GET /tourist-points/search
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: @Public() - acceso completamente público
   */
  @Get('search')
  @Public() // 🔓 SEPARACIÓN: Acceso público sin autenticación
  @ApiOperation({ summary: 'Buscar puntos turísticos por término y/o categoría' })
  @ApiResponse({ status: 200, description: 'Puntos turísticos encontrados' })
  searchPoints(@Query() queryDto: QueryTouristPointDto) {
    return this.touristPointService.findAll(queryDto);
  }

  // ========================================
  // 🔍 RUTAS CON PARÁMETROS ESPECÍFICOS - GRUPO 3: CONSULTAS CON PARÁMETROS
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN ANTES de ':id' para evitar conflictos
  // ========================================

  /**
   * 📂 POR CATEGORÍA - GET /tourist-points/category/:category
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: @Public() - acceso completamente público
   */
  @Get('category/:category')
  @Public() // 🔓 SEPARACIÓN: Acceso público sin autenticación
  @ApiOperation({ summary: 'Obtener puntos turísticos por categoría' })
  @ApiResponse({ status: 200, description: 'Puntos turísticos de la categoría especificada' })
  findByCategory(@Param('category') category: string) {
    return this.touristPointService.findByCategory(category);
  }

  /**
   * 📍 PUNTOS CERCANOS - GET /tourist-points/nearby/:lat/:lng
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: @Public() - acceso completamente público
   */
  @Get('nearby/:lat/:lng')
  @Public() // 🔓 SEPARACIÓN: Acceso público sin autenticación
  @ApiOperation({ summary: 'Obtener puntos turísticos cercanos a una ubicación' })
  @ApiResponse({ status: 200, description: 'Puntos turísticos cercanos' })
  findNearby(
    @Param('lat', ParseFloatPipe) lat: number,
    @Param('lng', ParseFloatPipe) lng: number,
    @Query('radius', ParseFloatPipe) radius?: number
  ) {
    return this.touristPointService.findNearby(lat, lng, radius);
  }

  // ========================================
  // 🔍 RUTAS CON PARÁMETROS ID - GRUPO 4: OPERACIONES POR ID
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN DESPUÉS de todas las rutas específicas
  // ========================================

  /**
   * 🔍 LEER UNO - GET /tourist-points/:id
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: @Public() - acceso completamente público
   */
  @Get(':id')
  @Public() // 🔓 SEPARACIÓN: Acceso público sin autenticación
  @ApiOperation({ summary: 'Obtener punto turístico por ID' })
  @ApiResponse({ status: 200, description: 'Punto turístico encontrado' })
  @ApiResponse({ status: 404, description: 'Punto turístico no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.touristPointService.findOne(id);
  }

  /**
   * 🔎 DETALLES COMPLETOS - GET /tourist-points/:id/details
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: @Public() - acceso completamente público
   */
  @Get(':id/details')
  @Public() // 🔓 SEPARACIÓN: Acceso público sin autenticación
  @ApiOperation({ summary: 'Obtener punto turístico con detalles completos (MongoDB)' })
  @ApiResponse({ status: 200, description: 'Punto turístico con detalles completos' })
  findOneWithDetails(@Param('id', ParseIntPipe) id: number) {
    return this.touristPointService.findOneWithDetails(id);
  }

  // ========================================
  // 📝 OPERACIONES DE INTERACCIÓN - GRUPO 5: RESEÑAS Y COMENTARIOS
  // ========================================

  /**
   * ⭐ AGREGAR RESEÑA - POST /tourist-points/:id/reviews
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Guard específico JWT para usuarios autenticados
   */
  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard) // 🔐 SEPARACIÓN: Guard específico para usuarios autenticados
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar reseña a un punto turístico' })
  @ApiResponse({ status: 201, description: 'Reseña agregada exitosamente' })
  addReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() addReviewDto: AddReviewDto,
    @GetUser() user: User
  ) {
    return this.touristPointService.addReview(id, user.id_usuario, addReviewDto);
  }

  // ========================================
  // ✏️ OPERACIONES DE ACTUALIZACIÓN - GRUPO 6: RUTAS PATCH
  // ========================================

  /**
   * ✏️ ACTUALIZAR - PATCH /tourist-points/:id
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Guards específicos para roles de edición
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔐 SEPARACIÓN: Guards específicos para editores
  @Roles('Super Administrador', 'Administrador', 'Editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar punto turístico' })
  @ApiResponse({ status: 200, description: 'Punto turístico actualizado exitosamente' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateTouristPointDto: UpdateTouristPointDto
  ) {
    return this.touristPointService.update(id, updateTouristPointDto);
  }

  /**
   * ✅ APROBAR - PATCH /tourist-points/:id/approve
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Guards específicos para roles de moderación
   */
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔐 SEPARACIÓN: Guards específicos para moderadores
  @Roles('Super Administrador', 'Administrador', 'Moderador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aprobar punto turístico pendiente' })
  @ApiResponse({ status: 200, description: 'Punto turístico aprobado exitosamente' })
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.touristPointService.approve(id);
  }

  /**
   * ❌ RECHAZAR - PATCH /tourist-points/:id/reject
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Guards específicos para roles de moderación
   */
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔐 SEPARACIÓN: Guards específicos para moderadores
  @Roles('Super Administrador', 'Administrador', 'Moderador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rechazar punto turístico pendiente' })
  @ApiResponse({ status: 200, description: 'Punto turístico rechazado exitosamente' })
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.touristPointService.reject(id);
  }

  // ========================================
  // 🗑️ OPERACIONES DE ELIMINACIÓN - GRUPO 7: RUTAS DELETE
  // ========================================

  /**
   * 🗑️ ELIMINAR - DELETE /tourist-points/:id
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Guards específicos para roles administrativos
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔐 SEPARACIÓN: Guards específicos para administradores
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar punto turístico' })
  @ApiResponse({ status: 204, description: 'Punto turístico eliminado exitosamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.touristPointService.remove(id);
  }
}
