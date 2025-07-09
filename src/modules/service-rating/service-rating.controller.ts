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
import { ServiceRatingService } from './service-rating.service';
import { CreateServiceRatingDto } from './dto/create-service-rating.dto';
import { UpdateServiceRatingDto } from './dto/update-service-rating.dto';
import { QueryServiceRatingDto } from './dto/query-service-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../../models/mysql/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Calificaciones de Servicios')
@Controller('service-ratings')
@UseInterceptors(ClassSerializerInterceptor)
export class ServiceRatingController {
  constructor(private readonly serviceRatingService: ServiceRatingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
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

  @Get()
  @Public()
  @ApiOperation({ summary: 'Obtener todas las calificaciones con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de calificaciones' })
  findAll(@Query() queryDto: QueryServiceRatingDto) {
    return this.serviceRatingService.findAll(queryDto);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de calificaciones' })
  @ApiResponse({ status: 200, description: 'Estadísticas de calificaciones' })
  getStatistics() {
    return this.serviceRatingService.getRatingStatistics();
  }

  @Get('services')
  @Public()
  @ApiOperation({ summary: 'Obtener lista de servicios únicos' })
  @ApiResponse({ status: 200, description: 'Lista de servicios' })
  getServices() {
    return this.serviceRatingService.getUniqueServices();
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Obtener lista de categorías únicas' })
  @ApiResponse({ status: 200, description: 'Lista de categorías' })
  getCategories() {
    return this.serviceRatingService.getUniqueCategories();
  }

  @Get('service/:serviceName')
  @Public()
  @ApiOperation({ summary: 'Obtener calificaciones por servicio específico' })
  @ApiResponse({ status: 200, description: 'Calificaciones del servicio' })
  findByService(@Param('serviceName') serviceName: string) {
    return this.serviceRatingService.findByService(serviceName);
  }

  @Get('category/:categoryName')
  @Public()
  @ApiOperation({ summary: 'Obtener calificaciones por categoría' })
  @ApiResponse({ status: 200, description: 'Calificaciones de la categoría' })
  findByCategory(@Param('categoryName') categoryName: string) {
    return this.serviceRatingService.findByCategory(categoryName);
  }

  @Get('average/:serviceName')
  @Public()
  @ApiOperation({ summary: 'Obtener promedio de calificaciones de un servicio' })
  @ApiResponse({ status: 200, description: 'Promedio de calificaciones' })
  getServiceAverage(@Param('serviceName') serviceName: string) {
    return this.serviceRatingService.getServiceAverage(serviceName);
  }

  @Get('monthly-report/:year')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener reporte mensual de calificaciones' })
  @ApiResponse({ status: 200, description: 'Reporte mensual' })
  getMonthlyReport(@Param('year', ParseIntPipe) year: number) {
    return this.serviceRatingService.getMonthlyReport(year);
  }

  @Get('trending')
  @Public()
  @ApiOperation({ summary: 'Obtener servicios con mejores tendencias' })
  @ApiResponse({ status: 200, description: 'Servicios trending' })
  getTrendingServices() {
    return this.serviceRatingService.getTrendingServices();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener calificación por ID' })
  @ApiResponse({ status: 200, description: 'Calificación encontrada' })
  @ApiResponse({ status: 404, description: 'Calificación no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceRatingService.findOne(id);
  }

  @Get(':id/details')
  @Public()
  @ApiOperation({ summary: 'Obtener calificación con detalles completos (MongoDB)' })
  @ApiResponse({ status: 200, description: 'Calificación con detalles completos' })
  findOneWithDetails(@Param('id', ParseIntPipe) id: number) {
    return this.serviceRatingService.findOneWithDetails(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar calificación' })
  @ApiResponse({ status: 204, description: 'Calificación eliminada exitosamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviceRatingService.remove(id);
  }
} 