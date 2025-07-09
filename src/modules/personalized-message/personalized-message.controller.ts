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
import { PersonalizedMessageService } from './personalized-message.service';
import { CreatePersonalizedMessageDto } from './dto/create-personalized-message.dto';
import { UpdatePersonalizedMessageDto } from './dto/update-personalized-message.dto';
import { QueryPersonalizedMessageDto } from './dto/query-personalized-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../../models/mysql/user.entity';

@ApiTags('Mensajes Personalizados')
@Controller('personalized-messages')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class PersonalizedMessageController {
  constructor(private readonly personalizedMessageService: PersonalizedMessageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
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

  @Get()
  @ApiOperation({ summary: 'Obtener todos los mensajes con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de mensajes' })
  findAll(@Query() queryDto: QueryPersonalizedMessageDto) {
    return this.personalizedMessageService.findAll(queryDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener solo mensajes activos' })
  @ApiResponse({ status: 200, description: 'Lista de mensajes activos' })
  findActiveMessages() {
    return this.personalizedMessageService.findActiveMessages();
  }

  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de mensajes' })
  @ApiResponse({ status: 200, description: 'Estadísticas de mensajes' })
  getStatistics() {
    return this.personalizedMessageService.getMessageStatistics();
  }

  @Get('route/:routeId')
  @ApiOperation({ summary: 'Obtener mensajes por ruta' })
  @ApiResponse({ status: 200, description: 'Mensajes de la ruta especificada' })
  findByRoute(@Param('routeId', ParseIntPipe) routeId: number) {
    return this.personalizedMessageService.findByRoute(routeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener mensaje por ID' })
  @ApiResponse({ status: 200, description: 'Mensaje encontrado' })
  @ApiResponse({ status: 404, description: 'Mensaje no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personalizedMessageService.findOne(id);
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Obtener mensaje con detalles completos (MongoDB)' })
  @ApiResponse({ status: 200, description: 'Mensaje con detalles completos' })
  findOneWithDetails(@Param('id', ParseIntPipe) id: number) {
    return this.personalizedMessageService.findOneWithDetails(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('Super Administrador', 'Administrador')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar mensaje' })
  @ApiResponse({ status: 204, description: 'Mensaje eliminado exitosamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personalizedMessageService.remove(id);
  }
}