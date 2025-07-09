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
@Controller('stations')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class StationController {
  constructor(private readonly stationService: StationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador', 'Editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva estación' })
  @ApiResponse({ status: 201, description: 'Estación creada exitosamente' })
  create(@Body() createStationDto: CreateStationDto) {
    return this.stationService.create(createStationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las estaciones con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de estaciones' })
  findAll(@Query() queryDto: QueryStationDto) {
    return this.stationService.findAll(queryDto);
  }

  @Get('operational')
  @ApiOperation({ summary: 'Obtener solo estaciones operativas' })
  @ApiResponse({ status: 200, description: 'Lista de estaciones operativas' })
  findOperationalStations() {
    return this.stationService.findOperationalStations();
  }

  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de estaciones' })
  @ApiResponse({ status: 200, description: 'Estadísticas de estaciones' })
  getStatistics() {
    return this.stationService.getStationStatistics();
  }

  @Get('transport/:transportType')
  @ApiOperation({ summary: 'Obtener estaciones por tipo de transporte' })
  @ApiResponse({ status: 200, description: 'Estaciones del tipo de transporte especificado' })
  findByTransportType(@Param('transportType') transportType: 'metro' | 'bus' | 'trolebus' | 'ecovia') {
    return this.stationService.findByTransportType(transportType);
  }

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

  @Get(':id')
  @ApiOperation({ summary: 'Obtener estación por ID' })
  @ApiResponse({ status: 200, description: 'Estación encontrada' })
  @ApiResponse({ status: 404, description: 'Estación no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stationService.findOne(id);
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Obtener estación con detalles completos (MongoDB)' })
  @ApiResponse({ status: 200, description: 'Estación con detalles completos' })
  findOneWithDetails(@Param('id', ParseIntPipe) id: number) {
    return this.stationService.findOneWithDetails(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar estación' })
  @ApiResponse({ status: 204, description: 'Estación eliminada exitosamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stationService.remove(id);
  }
}