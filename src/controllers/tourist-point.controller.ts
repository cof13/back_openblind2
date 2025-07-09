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
@Controller('tourist-points')
@UseInterceptors(ClassSerializerInterceptor)
export class TouristPointController {
  constructor(private readonly touristPointService: TouristPointService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
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

  @Get()
  @Public()
  @ApiOperation({ summary: 'Obtener todos los puntos turísticos con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de puntos turísticos' })
  findAll(@Query() queryDto: QueryTouristPointDto) {
    return this.touristPointService.findAll(queryDto);
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Obtener solo puntos turísticos activos' })
  @ApiResponse({ status: 200, description: 'Lista de puntos turísticos activos' })
  findActivePoints() {
    return this.touristPointService.findActivePoints();
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de puntos turísticos' })
  @ApiResponse({ status: 200, description: 'Estadísticas de puntos turísticos' })
  getStatistics() {
    return this.touristPointService.getTouristPointStatistics();
  }

  @Get('category/:category')
  @Public()
  @ApiOperation({ summary: 'Obtener puntos turísticos por categoría' })
  @ApiResponse({ status: 200, description: 'Puntos turísticos de la categoría especificada' })
  findByCategory(@Param('category') category: string) {
    return this.touristPointService.findByCategory(category);
  }

  @Get('nearby/:lat/:lng')
  @Public()
  @ApiOperation({ summary: 'Obtener puntos turísticos cercanos a una ubicación' })
  @ApiResponse({ status: 200, description: 'Puntos turísticos cercanos' })
  findNearby(
    @Param('lat', ParseFloatPipe) lat: number,
    @Param('lng', ParseFloatPipe) lng: number,
    @Query('radius', ParseFloatPipe) radius?: number
  ) {
    return this.touristPointService.findNearby(lat, lng, radius);
  }

  @Get('top-rated')
  @Public()
  @ApiOperation({ summary: 'Obtener puntos turísticos mejor calificados' })
  @ApiResponse({ status: 200, description: 'Puntos turísticos mejor calificados' })
  findTopRated(@Query('limit', ParseIntPipe) limit?: number) {
    return this.touristPointService.findTopRated(limit);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Buscar puntos turísticos por término y/o categoría' })
  @ApiResponse({ status: 200, description: 'Puntos turísticos encontrados' })
  searchPoints(@Query() queryDto: QueryTouristPointDto) {
    return this.touristPointService.findAll(queryDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener punto turístico por ID' })
  @ApiResponse({ status: 200, description: 'Punto turístico encontrado' })
  @ApiResponse({ status: 404, description: 'Punto turístico no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.touristPointService.findOne(id);
  }

  @Get(':id/details')
  @Public()
  @ApiOperation({ summary: 'Obtener punto turístico con detalles completos (MongoDB)' })
  @ApiResponse({ status: 200, description: 'Punto turístico con detalles completos' })
  findOneWithDetails(@Param('id', ParseIntPipe) id: number) {
    return this.touristPointService.findOneWithDetails(id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
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

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Administrador', 'Administrador', 'Moderador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aprobar punto turístico pendiente' })
  @ApiResponse({ status: 200, description: 'Punto turístico aprobado exitosamente' })
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.touristPointService.approve(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Administrador', 'Administrador', 'Moderador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rechazar punto turístico pendiente' })
  @ApiResponse({ status: 200, description: 'Punto turístico rechazado exitosamente' })
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.touristPointService.reject(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar punto turístico' })
  @ApiResponse({ status: 204, description: 'Punto turístico eliminado exitosamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.touristPointService.remove(id);
  }
}