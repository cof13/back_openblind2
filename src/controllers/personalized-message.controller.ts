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
import { PersonalizedMessageService } from '../services/personalized-message.service';
import { CreatePersonalizedMessageDto } from '../modules/personalized-message/dto/create-personalized-message.dto';
import { UpdatePersonalizedMessageDto } from '../modules/personalized-message/dto/update-personalized-message.dto';
import { QueryPersonalizedMessageDto } from '../modules/personalized-message/dto/query-personalized-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../models/mysql/user.entity';

@ApiTags('Mensajes Personalizados')
@Controller('personalized-messages') // 🔗 RUTA BASE: '/personalized-messages' - TODAS LAS RUTAS AGRUPADAS BAJO ESTA BASE
@UseGuards(JwtAuthGuard) // 🔐 AUTENTICACIÓN: Aplica a todas las rutas - AGRUPACIÓN GLOBAL DE SEGURIDAD
@UseInterceptors(ClassSerializerInterceptor)
export class PersonalizedMessageController {
  constructor(private readonly personalizedMessageService: PersonalizedMessageService) {}

  // ========================================
  // 📝 OPERACIONES CRUD BÁSICAS - GRUPO 1: RUTAS ESTÁNDAR
  // ========================================
  
  /**
   * 🆕 CREAR - POST /personalized-messages
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Tiene su propio guard adicional para roles específicos
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard adicional específico para esta ruta
  @Roles('Super Administrador', 'Administrador', 'Editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nuevo mensaje personalizado' })
  @ApiResponse({ status: 201, description: 'Mensaje creado exitosamente' })
  async create(
    @Body() createMessageDto: CreatePersonalizedMessageDto,
    @GetUser() user: User
  ) {
    createMessageDto.id_usuario_creador = user.id_usuario;
    return this.personalizedMessageService.create(createMessageDto);
  }

  /**
   * 📋 LEER TODOS - GET /personalized-messages
   * AGRUPADA: Solo usa la autenticación JWT del controlador
   * SEPARADA: Sin guards adicionales - acceso público (solo JWT)
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los mensajes con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de mensajes' })
  findAll(@Query() queryDto: QueryPersonalizedMessageDto) {
    return this.personalizedMessageService.findAll(queryDto);
  }

  // ========================================
  // 🔍 RUTAS ESPECIALIZADAS - GRUPO 2: CONSULTAS ESPECÍFICAS
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN ANTES de ':id' para evitar conflictos
  // ========================================
  
  /**
   * ✅ MENSAJES ACTIVOS - GET /personalized-messages/active
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Ruta específica que debe ir antes de ':id'
   */
  @Get('active')
  @ApiOperation({ summary: 'Obtener solo mensajes activos' })
  @ApiResponse({ status: 200, description: 'Lista de mensajes activos' })
  findActiveMessages() {
    return this.personalizedMessageService.findActiveMessages();
  }

  /**
   * 📊 ESTADÍSTICAS - GET /personalized-messages/statistics
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional para roles administrativos
   */
  @Get('statistics')
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para administradores
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de mensajes' })
  @ApiResponse({ status: 200, description: 'Estadísticas de mensajes' })
  getStatistics() {
    return this.personalizedMessageService.getMessageStatistics();
  }

  /**
   * 🛣️ MENSAJES POR RUTA - GET /personalized-messages/route/:routeId
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Ruta específica con parámetro propio
   */
  @Get('route/:routeId')
  @ApiOperation({ summary: 'Obtener mensajes por ruta' })
  @ApiResponse({ status: 200, description: 'Mensajes de la ruta especificada' })
  findByRoute(@Param('routeId', ParseIntPipe) routeId: number) {
    return this.personalizedMessageService.findByRoute(routeId);
  }

  // ========================================
  // 🔍 RUTAS CON PARÁMETROS - GRUPO 3: OPERACIONES POR ID
  // ⚠️ SEPARACIÓN CRÍTICA: Estas rutas VAN DESPUÉS de rutas específicas
  // ========================================

  /**
   * 🔍 LEER UNO - GET /personalized-messages/:id
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Colocada después de rutas específicas para evitar conflictos
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener mensaje por ID' })
  @ApiResponse({ status: 200, description: 'Mensaje encontrado' })
  @ApiResponse({ status: 404, description: 'Mensaje no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personalizedMessageService.findOne(id);
  }

  /**
   * 🔎 DETALLES COMPLETOS - GET /personalized-messages/:id/details
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Extiende la ruta ':id' con funcionalidad adicional
   */
  @Get(':id/details')
  @ApiOperation({ summary: 'Obtener mensaje con detalles completos (MongoDB)' })
  @ApiResponse({ status: 200, description: 'Mensaje con detalles completos' })
  findOneWithDetails(@Param('id', ParseIntPipe) id: number) {
    return this.personalizedMessageService.findOneWithDetails(id);
  }

  /**
   * ✏️ ACTUALIZAR - PATCH /personalized-messages/:id
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional específico para roles de edición
   */
  @Patch(':id')
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para editores
  @Roles('Super Administrador', 'Administrador', 'Editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar mensaje' })
  @ApiResponse({ status: 200, description: 'Mensaje actualizado exitosamente' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateMessageDto: UpdatePersonalizedMessageDto
  ) {
    return this.personalizedMessageService.update(id, updateMessageDto);
  }

  /**
   * 🗑️ ELIMINAR - DELETE /personalized-messages/:id
   * AGRUPADA: Hereda autenticación JWT del controlador
   * SEPARADA: Guard adicional específico para roles administrativos
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard) // 🔐 SEPARACIÓN: Guard específico para administradores
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar mensaje' })
  @ApiResponse({ status: 204, description: 'Mensaje eliminado exitosamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personalizedMessageService.remove(id);
  }
}