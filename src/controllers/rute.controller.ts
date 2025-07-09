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
@Controller('routes')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
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

  @Get()
  @ApiOperation({ summary: 'Obtener todas las rutas con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de rutas' })
  findAll(@Query() queryDto: QueryRouteDto) {
    return this.routeService.findAll(queryDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener solo rutas activas' })
  @ApiResponse({ status: 200, description: 'Lista de rutas activas' })
  findActiveRoutes() {
    return this.routeService.findActiveRoutes();
  }

  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de rutas' })
  @ApiResponse({ status: 200, description: 'Estadísticas de rutas' })
  getStatistics() {
    return this.routeService.getRouteStatistics();
  }

  @Get('transport/:transportType')
  @ApiOperation({ summary: 'Obtener rutas por tipo de transporte' })
  @ApiResponse({ status: 200, description: 'Rutas del tipo de transporte especificado' })
  findByTransportType(@Param('transportType') transportType: string) {
    return this.routeService.findByTransportType(transportType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ruta por ID' })
  @ApiResponse({ status: 200, description: 'Ruta encontrada' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.routeService.findOne(id);
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Obtener detalles de la ruta por ID' })
  @ApiResponse({ status: 200, description: 'Detalles de la ruta encontrados' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  findOneWithDetails(@Param('id', ParseIntPipe) id: number) {
    return this.routeService.findOneWithDetails(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador', 'Editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar ruta por ID' })
  @ApiResponse({ status: 200, description: 'Ruta actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRouteDto: UpdateRouteDto) {
    return this.routeService.update(id, updateRouteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar ruta por ID' })
  @ApiResponse({ status: 204, description: 'Ruta eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.routeService.remove(id);
  }
}
