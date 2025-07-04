// src/modules/auth/auth.service.ts
import { 
  Injectable, 
  UnauthorizedException, 
  BadRequestException,
  ConflictException,
  Logger,
  ForbiddenException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PasswordUtil } from '../../common/utils/password.util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from '../../models/mysql/user.entity';

import { AuthResponse } from './dto/auth-response.dto';


interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findOneByEmail(email);
      
      if (!user) {
        return null;
      }

      // Verificar que el usuario esté activo
      if (user.estado !== 'activo') {
        throw new ForbiddenException('Usuario inactivo o suspendido');
      }

      // Verificar contraseña
      const isPasswordValid = await PasswordUtil.compare(password, user.password);
      
      if (!isPasswordValid) {
        return null;
      }

      // Remover contraseña del objeto usuario
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(`Error validando usuario: ${error.message}`);
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      
      if (!user) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Actualizar último acceso
      await this.userService.updateLastAccess(user.id_usuario);

      // Generar tokens
      const payload: JwtPayload = { 
        sub: user.id_usuario, 
        email: user.email,
        role: user.role.nombre_rol
      };

      const access_token = this.jwtService.sign(payload);
      const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

      this.logger.log(`✅ Login exitoso: ${user.email}`);

      return {
        user: {
          id_usuario: user.id_usuario,
          nombres: user.nombres,
          apellidos: user.apellidos,
          email: user.email,
          telefono: user.telefono,
          fecha_nacimiento: user.fecha_nacimiento,
          estado: user.estado,
          role: user.role,
          ultimo_acceso: user.ultimo_acceso,
        },
        access_token,
        refresh_token,
        token_type: 'Bearer',
        expires_in: 86400, // 24 horas en segundos
      };
    } catch (error) {
      this.logger.error(`❌ Error en login: ${error.message}`);
      throw error;
    }
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      // Validar contraseña
      const passwordErrors = PasswordUtil.validate(registerDto.password);
      if (passwordErrors.length > 0) {
        throw new BadRequestException({
          message: 'La contraseña no cumple con los requisitos',
          errors: passwordErrors
        });
      }

      // Verificar que no exista un usuario con el mismo email
      const existingUser = await this.userService.findOneByEmail(registerDto.email);
      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }

      // Crear usuario (por defecto con rol Usuario Estándar)
      const userData = {
        ...registerDto,
        id_rol: registerDto.id_rol || 6, // Usuario Estándar por defecto
        estado: 'activo' as const,
      };

      const user = await this.userService.create(userData);

      this.logger.log(`✅ Usuario registrado: ${user.email}`);

      // Autenticar automáticamente después del registro
      return this.login({
        email: registerDto.email,
        password: registerDto.password,
      });
    } catch (error) {
      this.logger.error(`❌ Error en registro: ${error.message}`);
      throw error;
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      // Verificar el refresh token
      const decoded = this.jwtService.verify(refreshTokenDto.refresh_token);
      
      // Obtener usuario actualizado
      const user = await this.userService.findOne(decoded.sub);
      
      if (!user || user.estado !== 'activo') {
        throw new UnauthorizedException('Token inválido o usuario inactivo');
      }

      // Generar nuevos tokens
      const payload: JwtPayload = { 
        sub: user.id_usuario, 
        email: user.email,
        role: user.role.nombre_rol
      };

      const access_token = this.jwtService.sign(payload);
      const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

      this.logger.log(`✅ Token renovado: ${user.email}`);

      return {
        user: {
          id_usuario: user.id_usuario,
          nombres: user.nombres,
          apellidos: user.apellidos,
          email: user.email,
          telefono: user.telefono,
          fecha_nacimiento: user.fecha_nacimiento,
          estado: user.estado,
          role: user.role,
          ultimo_acceso: user.ultimo_acceso,
        },
        access_token,
        refresh_token,
        token_type: 'Bearer',
        expires_in: 86400,
      };
    } catch (error) {
      this.logger.error(`❌ Error renovando token: ${error.message}`);
      throw new UnauthorizedException('Token de actualización inválido');
    }
  }

  async getProfile(userId: number): Promise<any> {
    try {
      const user = await this.userService.findOne(userId);
      
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return {
        id_usuario: user.id_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        telefono: user.telefono,
        fecha_nacimiento: user.fecha_nacimiento,
        estado: user.estado,
        role: user.role,
        ultimo_acceso: user.ultimo_acceso,
      };
    } catch (error) {
      this.logger.error(`❌ Error obteniendo perfil: ${error.message}`);
      throw error;
    }
  }

  async logout(userId: number): Promise<{ message: string }> {
    try {
      // Aquí podrías implementar una blacklist de tokens si es necesario
      // Por ahora, simplemente devolvemos un mensaje de éxito
      this.logger.log(`✅ Logout exitoso: ${userId}`);
      
      return {
        message: 'Sesión cerrada exitosamente'
      };
    } catch (error) {
      this.logger.error(`❌ Error en logout: ${error.message}`);
      throw error;
    }
  }

  async validateJwtPayload(payload: JwtPayload): Promise<any> {
    try {
      const user = await this.userService.findOne(payload.sub);
      
      if (!user || user.estado !== 'activo') {
        throw new UnauthorizedException('Usuario inválido o inactivo');
      }

      return user;
    } catch (error) {
      this.logger.error(`❌ Error validando JWT: ${error.message}`);
      throw new UnauthorizedException('Token inválido');
    }
  }
}