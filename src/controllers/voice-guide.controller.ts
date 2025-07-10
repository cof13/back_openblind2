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
import { VoiceGuideService } from '../services/voice-guide.service';
import { CreateVoiceGuideDto } from '../modules/voice-guide/dto/create-voice-guide.dto';
import { UpdateVoiceGuideDto } from '../modules/voice-guide/dto/update-voice-guide.dto';
import { QueryVoiceGuideDto } from '../modules/voice-guide/dto/query-voice-guide.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Guías de Voz')
@Controller('voice-guides') // 🔗 RUTA BASE: '/voice-guides' - TODAS LAS RUTAS AGRUPADAS BAJO ESTA BASE
@UseGuards(JwtAuthGuard) // 🔐 AUTENTICACIÓN: Aplica a todas las rutas - AGRUPACIÓN GLOBAL DE SEGURIDAD
@UseInterceptors(ClassSerializerInterceptor)
export class VoiceGuideController {
  constructor(private readonly voiceGuideService: VoiceGuideService) {}

  // ========================================
  // 📝 OPERACIONES CRUD BÁSICAS - GRUPO 1: RUTAS ESTÁNDAR
  // ========================================

  /**
   * 🆕 CREAR - POST /voice-guides
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Tiene su propio guard adicional para roles específicos
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard adicional específico para editores
  @Roles('Super Administrador', 'Administrador', 'Editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva guía de voz' })
  @ApiResponse({ status: 201, description: 'Guía de voz creada exitosamente' })
  create(@Body() createVoiceGuideDto: CreateVoiceGuideDto) {
    return this.voiceGuideService.create(createVoiceGuideDto);
  }

  /**
   * 📋 LEER TODOS - GET /voice-guides
   * AGRUPADA: Solo usa la autenticación JWT del controlador
   * SEPARADA: Sin guards adicionales - acceso público (solo JWT)
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las guías de voz con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de guías de voz' })
  findAll(@Query() queryDto: QueryVoiceGuideDto) {
    return this.voiceGuideService.findAll(queryDto);
  }

  // ========================================
  // 🔍 RUTAS ESPECIALIZADAS - GRUPO 2: CONSULTAS ESPECÍFICAS
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN ANTES de ':id' para evitar conflictos
  // ========================================

  /**
   * ✅ GUÍAS ACTIVAS - GET /voice-guides/active
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Ruta específica que debe ir antes de ':id'
   */
  @Get('active')
  @ApiOperation({ summary: 'Obtener solo guías de voz activas' })
  @ApiResponse({ status: 200, description: 'Lista de guías de voz activas' })
  findActiveGuides() {
    return this.voiceGuideService.findActiveGuides();
  }

  /**
   * 📊 ESTADÍSTICAS - GET /voice-guides/statistics
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional para roles administrativos
   */
  @Get('statistics')
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para administradores
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de guías de voz' })
  @ApiResponse({ status: 200, description: 'Estadísticas de guías de voz' })
  getStatistics() {
    return this.voiceGuideService.getVoiceGuideStatistics();
  }

  // ========================================
  // 🔍 RUTAS CON PARÁMETROS ESPECÍFICOS - GRUPO 3: CONSULTAS CON PARÁMETROS
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN ANTES de ':id' para evitar conflictos
  // ========================================

  /**
   * 🛣️ GUÍAS POR RUTA - GET /voice-guides/route/:routeId
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Ruta específica con parámetro propio
   */
  @Get('route/:routeId')
  @ApiOperation({ summary: 'Obtener guías de voz por ruta' })
  @ApiResponse({ status: 200, description: 'Guías de voz de la ruta especificada' })
  findByRoute(@Param('routeId', ParseIntPipe) routeId: number) {
    return this.voiceGuideService.findByRoute(routeId);
  }

  /**
   * 💬 GUÍAS POR MENSAJE - GET /voice-guides/message/:messageId
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Ruta específica con parámetro propio
   */
  @Get('message/:messageId')
  @ApiOperation({ summary: 'Obtener guías de voz por mensaje' })
  @ApiResponse({ status: 200, description: 'Guías de voz del mensaje especificado' })
  findByMessage(@Param('messageId', ParseIntPipe) messageId: number) {
    return this.voiceGuideService.findByMessage(messageId);
  }

  // ========================================
  // 🔍 RUTAS CON PARÁMETROS ID - GRUPO 4: OPERACIONES POR ID
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN DESPUÉS de todas las rutas específicas
  // ========================================

  /**
   * 🔍 LEER UNO - GET /voice-guides/:id
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Colocada después de rutas específicas para evitar conflictos
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener guía de voz por ID' })
  @ApiResponse({ status: 200, description: 'Guía de voz encontrada' })
  @ApiResponse({ status: 404, description: 'Guía de voz no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.voiceGuideService.findOne(id);
  }

  /**
   * 📈 GUÍA CON ESTADÍSTICAS - GET /voice-guides/:id/stats
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Extiende la ruta ':id' con funcionalidad de estadísticas
   */
  @Get(':id/stats')
  @ApiOperation({ summary: 'Obtener guía de voz con estadísticas' })
  @ApiResponse({ status: 200, description: 'Guía de voz con estadísticas completas' })
  findOneWithStats(@Param('id', ParseIntPipe) id: number) {
    return this.voiceGuideService.findOneWithStats(id);
  }

  // ========================================
  // ✏️ OPERACIONES DE ACTUALIZACIÓN - GRUPO 5: RUTAS PATCH
  // ========================================

  /**
   * ✏️ ACTUALIZAR - PATCH /voice-guides/:id
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional específico para roles de edición
   */
  @Patch(':id')
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para editores
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

  /**
   * 📊 ACTUALIZAR REPRODUCCIÓN - PATCH /voice-guides/:id/playback
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Operación específica para tracking de reproducción
   */
  @Patch(':id/playback')
  @ApiOperation({ summary: 'Actualizar estadísticas de reproducción' })
  @ApiResponse({ status: 200, description: 'Estadísticas actualizadas' })
  updatePlaybackStats(
    @Param('id', ParseIntPipe) id: number,
    @Body() playbackData: { playbackTime: number }
  ) {
    return this.voiceGuideService.updatePlaybackStats(id, playbackData.playbackTime);
  }

  // ========================================
  // 🗑️ OPERACIONES DE ELIMINACIÓN - GRUPO 6: RUTAS DELETE
  // ========================================

  /**
   * 🗑️ ELIMINAR - DELETE /voice-guides/:id
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional específico para roles administrativos
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para administradores
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar guía de voz' })
  @ApiResponse({ status: 204, description: 'Guía de voz eliminada exitosamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.voiceGuideService.remove(id);
  }
}
