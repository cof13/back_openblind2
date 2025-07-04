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
import { VoiceGuideService } from './voice-guide.service';
import { CreateVoiceGuideDto } from './dto/create-voice-guide.dto';
import { UpdateVoiceGuideDto } from './dto/update-voice-guide.dto';
import { QueryVoiceGuideDto } from './dto/query-voice-guide.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Guías de Voz')
@Controller('voice-guides')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class VoiceGuideController {
  constructor(private readonly voiceGuideService: VoiceGuideService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador', 'Editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva guía de voz' })
  @ApiResponse({ status: 201, description: 'Guía de voz creada exitosamente' })
  create(@Body() createVoiceGuideDto: CreateVoiceGuideDto) {
    return this.voiceGuideService.create(createVoiceGuideDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las guías de voz con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de guías de voz' })
  findAll(@Query() queryDto: QueryVoiceGuideDto) {
    return this.voiceGuideService.findAll(queryDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener solo guías de voz activas' })
  @ApiResponse({ status: 200, description: 'Lista de guías de voz activas' })
  findActiveGuides() {
    return this.voiceGuideService.findActiveGuides();
  }

  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de guías de voz' })
  @ApiResponse({ status: 200, description: 'Estadísticas de guías de voz' })
  getStatistics() {
    return this.voiceGuideService.getVoiceGuideStatistics();
  }

  @Get('route/:routeId')
  @ApiOperation({ summary: 'Obtener guías de voz por ruta' })
  @ApiResponse({ status: 200, description: 'Guías de voz de la ruta especificada' })
  findByRoute(@Param('routeId', ParseIntPipe) routeId: number) {
    return this.voiceGuideService.findByRoute(routeId);
  }

  @Get('message/:messageId')
  @ApiOperation({ summary: 'Obtener guías de voz por mensaje' })
  @ApiResponse({ status: 200, description: 'Guías de voz del mensaje especificado' })
  findByMessage(@Param('messageId', ParseIntPipe) messageId: number) {
    return this.voiceGuideService.findByMessage(messageId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener guía de voz por ID' })
  @ApiResponse({ status: 200, description: 'Guía de voz encontrada' })
  @ApiResponse({ status: 404, description: 'Guía de voz no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.voiceGuideService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Obtener guía de voz con estadísticas' })
  @ApiResponse({ status: 200, description: 'Guía de voz con estadísticas completas' })
  findOneWithStats(@Param('id', ParseIntPipe) id: number) {
    return this.voiceGuideService.findOneWithStats(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador', 'Editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar guía de voz' })
  @ApiResponse({ status: 200, description: 'Guía de voz actualizada exitosamente' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateVoiceGuideDto: UpdateVoiceGuideDto
  ) {
    return this.voiceGuideService.update(id, updateVoiceGuideDto);
  }

  @Patch(':id/playback')
  @ApiOperation({ summary: 'Actualizar estadísticas de reproducción' })
  @ApiResponse({ status: 200, description: 'Estadísticas actualizadas' })
  updatePlaybackStats(
    @Param('id', ParseIntPipe) id: number,
    @Body() playbackData: { playbackTime: number }
  ) {
    return this.voiceGuideService.updatePlaybackStats(id, playbackData.playbackTime);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar guía de voz' })
  @ApiResponse({ status: 204, description: 'Guía de voz eliminada exitosamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.voiceGuideService.remove(id);
  }
}