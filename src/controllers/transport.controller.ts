import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransportService } from '../services/transport.service';
import { CreateTransportDto } from '../modules/transport/dto/create-transport.dto';
import { UpdateTransportDto } from '../modules/transport/dto/update-transport.dto';

@Controller('transport') // 🔗 RUTA BASE: '/transport' - TODAS LAS RUTAS AGRUPADAS BAJO ESTA BASE
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  // ========================================
  // 📝 OPERACIONES CRUD BÁSICAS - GRUPO 1: PATRÓN REST ESTÁNDAR
  // ⚠️ SEPARACIÓN: Sin guards - ACCESO PÚBLICO TOTAL
  // ========================================

  /**
   * 🆕 CREAR - POST /transport
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Sin autenticación - acceso público
   */
  @Post()
  create(@Body() createTransportDto: CreateTransportDto) {
    return this.transportService.create(createTransportDto);
  }

  /**
   * 📋 LEER TODOS - GET /transport
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Sin autenticación - acceso público
   */
  @Get()
  findAll() {
    return this.transportService.findAll();
  }

  /**
   * 🔍 LEER UNO - GET /transport/:id
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Sin autenticación - acceso público
   * ⚠️ POSICIÓN: Correctamente colocada al final (no hay rutas específicas que conflicten)
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transportService.findOne(+id);
  }

  /**
   * ✏️ ACTUALIZAR - PATCH /transport/:id
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Sin autenticación - acceso público
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransportDto: UpdateTransportDto) {
    return this.transportService.update(+id, updateTransportDto);
  }

  /**
   * 🗑️ ELIMINAR - DELETE /transport/:id
   * AGRUPADA: Hereda la ruta base del controlador
   * SEPARADA: Sin autenticación - acceso público
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transportService.remove(+id);
  }
}
