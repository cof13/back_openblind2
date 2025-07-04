// src/modules/auth/auth.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '../../models/mysql/user.entity';

@ApiTags('Authentication')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    schema: {
      type: 'object',
      properties: {
        user: { type: 'object' },
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        token_type: { type: 'string' },
        expires_in: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente',
    schema: {
      type: 'object',
      properties: {
        user: { type: 'object' },
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        token_type: { type: 'string' },
        expires_in: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar token de acceso' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token renovado exitosamente',
    schema: {
      type: 'object',
      properties: {
        user: { type: 'object' },
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        token_type: { type: 'string' },
        expires_in: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token de actualización inválido' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil del usuario',
    schema: {
      type: 'object',
      properties: {
        id_usuario: { type: 'number' },
        nombres: { type: 'string' },
        apellidos: { type: 'string' },
        email: { type: 'string' },
        telefono: { type: 'string' },
        fecha_nacimiento: { type: 'string' },
        estado: { type: 'string' },
        role: { type: 'object' },
        ultimo_acceso: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async getProfile(@GetUser() user: User) {
    return this.authService.getProfile(user.id_usuario);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ 
    status: 200, 
    description: 'Sesión cerrada exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async logout(@GetUser() user: User) {
    return this.authService.logout(user.id_usuario);
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validar token actual' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token válido',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        user: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async validateToken(@GetUser() user: User) {
    return {
      valid: true,
      user: {
        id_usuario: user.id_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        role: user.role,
        estado: user.estado
      }
    };
  }
}