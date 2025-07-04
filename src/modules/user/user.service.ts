// src/modules/user/user.service.ts (Con mejor manejo de errores)
import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException,
  UnauthorizedException,
  Logger 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../../models/mysql/user.entity';
import { Role } from '../../models/mysql/role.entity';
import { UserProfile } from '../../models/mongodb/user-profile.schema';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectModel(UserProfile.name)
    private readonly userProfileModel: Model<UserProfile>,
  ) {
    this.logger.log('✅ UserService inicializado correctamente');
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`🔄 Creando usuario: ${createUserDto.email}`);
    
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException(`El email '${createUserDto.email}' ya está registrado`);
    }

    // Verificar que el rol existe y está activo
    const role = await this.roleRepository.findOne({
      where: { id_rol: createUserDto.id_rol, estado: 'activo' }
    });

    if (!role) {
      throw new BadRequestException(`El rol con ID ${createUserDto.id_rol} no existe o no está activo`);
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Preparar datos del usuario
    const userData = {
      nombres: createUserDto.nombres,
      apellidos: createUserDto.apellidos,
      email: createUserDto.email,
      password: hashedPassword,
      telefono: createUserDto.telefono,
      fecha_nacimiento: createUserDto.fecha_nacimiento ? new Date(createUserDto.fecha_nacimiento) : undefined,
      id_rol: createUserDto.id_rol,
      estado: createUserDto.estado || 'activo' as const,
    };

    // Crear usuario
    const user = this.userRepository.create(userData);
    const savedUser = await this.userRepository.save(user);

    this.logger.log(`✅ Usuario creado en MySQL: ${savedUser.id_usuario}`);

    // Intentar crear perfil en MongoDB
    try {
      const userProfile = new this.userProfileModel({
        user_id: savedUser.id_usuario,
        preferencias: {
          idioma: 'es',
          velocidad_audio: 'normal',
          notificaciones: true,
          modo_contraste: 'normal',
          volumen_default: 70,
          autoplay_mensajes: true
        },
        configuracion_accesibilidad: {
          tamaño_fuente: 'normal',
          alto_contraste: false,
          lector_pantalla: false,
          vibracion_activada: true,
          audio_navegacion: true,
          señales_tacticas: false
        },
        estadisticas_uso: {
          total_rutas_utilizadas: 0,
          tiempo_total_navegacion: 0,
          distancia_total_recorrida: 0,
          ultimo_uso: new Date(),
          sesiones_totales: 0,
          promedio_tiempo_sesion: 0,
          rutas_completadas: 0,
          mensajes_escuchados: 0
        }
      });

      const savedProfile = await userProfile.save();
      this.logger.log(`✅ Perfil creado en MongoDB: ${savedProfile._id}`);

      // Actualizar el usuario con el ID del perfil de MongoDB
      savedUser.profile_mongo_id = savedProfile._id.toString();
      await this.userRepository.save(savedUser);

    } catch (error) {
      this.logger.error(`❌ Error al crear perfil MongoDB: ${error.message}`);
      // NO eliminar el usuario si falla MongoDB - continuar sin perfil
      this.logger.warn(`⚠️  Usuario creado sin perfil MongoDB: ${savedUser.id_usuario}`);
    }

    // Retornar usuario sin la contraseña
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['role'],
      select: {
        id_usuario: true,
        nombres: true,
        apellidos: true,
        email: true,
        telefono: true,
        fecha_nacimiento: true,
        estado: true,
        fecha_registro: true,
        fecha_actualizacion: true,
        ultimo_acceso: true,
        role: {
          id_rol: true,
          nombre_rol: true,
          descripcion: true,
          estado: true
        }
      },
      order: { fecha_registro: 'DESC' }
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id_usuario: id },
      relations: ['role'],
      select: {
        id_usuario: true,
        nombres: true,
        apellidos: true,
        email: true,
        telefono: true,
        fecha_nacimiento: true,
        estado: true,
        fecha_registro: true,
        fecha_actualizacion: true,
        ultimo_acceso: true,
        profile_mongo_id: true,
        role: {
          id_rol: true,
          nombre_rol: true,
          descripcion: true,
          estado: true
        }
      }
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
      select: {
        id_usuario: true,
        nombres: true,
        apellidos: true,
        email: true,
        password: true,
        telefono: true,
        fecha_nacimiento: true,
        estado: true,
        fecha_registro: true,
        fecha_actualizacion: true,
        ultimo_acceso: true,
        profile_mongo_id: true,
        role: {
          id_rol: true,
          nombre_rol: true,
          descripcion: true,
          estado: true
        }
      }
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Si se está actualizando el email, verificar que no exista otro usuario con ese email
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email }
      });

      if (existingUser) {
        throw new ConflictException(`El email '${updateUserDto.email}' ya está registrado`);
      }
    }

    // Si se está actualizando el rol, verificar que existe y está activo
    if (updateUserDto.id_rol && updateUserDto.id_rol !== user.id_rol) {
      const role = await this.roleRepository.findOne({
        where: { id_rol: updateUserDto.id_rol, estado: 'activo' }
      });

      if (!role) {
        throw new BadRequestException(`El rol con ID ${updateUserDto.id_rol} no existe o no está activo`);
      }
    }

    // Preparar datos de actualización
    const updateData: Partial<User> = {};
    
    if (updateUserDto.nombres) updateData.nombres = updateUserDto.nombres;
    if (updateUserDto.apellidos) updateData.apellidos = updateUserDto.apellidos;
    if (updateUserDto.email) updateData.email = updateUserDto.email;
    if (updateUserDto.telefono) updateData.telefono = updateUserDto.telefono;
    if (updateUserDto.id_rol) updateData.id_rol = updateUserDto.id_rol;
    if (updateUserDto.estado) updateData.estado = updateUserDto.estado;
    
    if (updateUserDto.fecha_nacimiento) {
      updateData.fecha_nacimiento = new Date(updateUserDto.fecha_nacimiento);
    }

    // Actualizar usuario
    await this.userRepository.update(id, updateData);
    
    // Obtener usuario actualizado
    const updatedUser = await this.findOne(id);
    return updatedUser;
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id_usuario: id },
      select: ['id_usuario', 'password']
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.current_password, 
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Hash de la nueva contraseña
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.new_password, saltRounds);

    // Actualizar contraseña
    await this.userRepository.update(id, { password: hashedNewPassword });
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);

    // Intentar eliminar perfil de MongoDB si existe
    if (user.profile_mongo_id) {
      try {
        await this.userProfileModel.findByIdAndDelete(user.profile_mongo_id);
        this.logger.log(`✅ Perfil MongoDB eliminado: ${user.profile_mongo_id}`);
      } catch (error) {
        this.logger.warn(`⚠️  No se pudo eliminar el perfil de MongoDB: ${error.message}`);
      }
    }

    // Eliminar usuario de MySQL
    await this.userRepository.delete(id);
    this.logger.log(`✅ Usuario eliminado: ${id}`);
  }

  async updateLastAccess(id: number): Promise<void> {
    await this.userRepository.update(id, { ultimo_acceso: new Date() });
  }

  async findActiveUsers(): Promise<User[]> {
    return await this.userRepository.find({
      where: { estado: 'activo' },
      relations: ['role'],
      select: {
        id_usuario: true,
        nombres: true,
        apellidos: true,
        email: true,
        telefono: true,
        fecha_nacimiento: true,
        estado: true,
        fecha_registro: true,
        fecha_actualizacion: true,
        ultimo_acceso: true,
        role: {
          id_rol: true,
          nombre_rol: true,
          descripcion: true,
          estado: true
        }
      },
      order: { nombres: 'ASC' }
    });
  }

  async getUserProfile(userId: number) {
    const user = await this.findOne(userId);
    
    if (!user.profile_mongo_id) {
      // Si no hay perfil, crear uno nuevo
      try {
        const userProfile = new this.userProfileModel({
          user_id: userId,
          preferencias: {
            idioma: 'es',
            velocidad_audio: 'normal',
            notificaciones: true,
            modo_contraste: 'normal',
            volumen_default: 70,
            autoplay_mensajes: true
          },
          configuracion_accesibilidad: {
            tamaño_fuente: 'normal',
            alto_contraste: false,
            lector_pantalla: false,
            vibracion_activada: true,
            audio_navegacion: true,
            señales_tacticas: false
          },
          estadisticas_uso: {
            total_rutas_utilizadas: 0,
            tiempo_total_navegacion: 0,
            distancia_total_recorrida: 0,
            ultimo_uso: new Date(),
            sesiones_totales: 0,
            promedio_tiempo_sesion: 0,
            rutas_completadas: 0,
            mensajes_escuchados: 0
          }
        });

        const savedProfile = await userProfile.save();
        
        // Actualizar el usuario con el ID del perfil
        await this.userRepository.update(userId, { 
          profile_mongo_id: savedProfile._id.toString() 
        });

        return {
          user: user,
          profile: savedProfile
        };
      } catch (error) {
        this.logger.error(`❌ Error al crear perfil: ${error.message}`);
        throw new BadRequestException('Error al crear el perfil de usuario');
      }
    }

    try {
      const profile = await this.userProfileModel.findById(user.profile_mongo_id);
      
      if (!profile) {
        throw new NotFoundException('Perfil de usuario no encontrado en MongoDB');
      }

      return {
        user: user,
        profile: profile
      };
    } catch (error) {
      this.logger.error(`❌ Error al obtener perfil: ${error.message}`);
      throw new NotFoundException('Error al obtener el perfil de usuario');
    }
  }

  async updateUserProfile(userId: number, profileData: any) {
    const user = await this.findOne(userId);
    
    if (!user.profile_mongo_id) {
      throw new NotFoundException('Perfil de usuario no encontrado');
    }

    try {
      const updatedProfile = await this.userProfileModel.findByIdAndUpdate(
        user.profile_mongo_id,
        profileData,
        { new: true }
      );

      if (!updatedProfile) {
        throw new NotFoundException('Perfil de usuario no encontrado en MongoDB');
      }

      return updatedProfile;
    } catch (error) {
      this.logger.error(`❌ Error al actualizar perfil: ${error.message}`);
      throw new BadRequestException('Error al actualizar el perfil de usuario');
    }
  }

  async findWithPagination(page: number = 1, limit: number = 10, search?: string) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .select([
        'user.id_usuario',
        'user.nombres',
        'user.apellidos', 
        'user.email',
        'user.telefono',
        'user.fecha_nacimiento',
        'user.estado',
        'user.fecha_registro',
        'user.fecha_actualizacion',
        'user.ultimo_acceso',
        'role.id_rol',
        'role.nombre_rol',
        'role.descripcion',
        'role.estado'
      ]);

    // Aplicar filtro de búsqueda si existe
    if (search) {
      queryBuilder.where(
        '(user.nombres LIKE :search OR user.apellidos LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Aplicar paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    
    // Ordenamiento
    queryBuilder.orderBy('user.fecha_registro', 'DESC');

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1
      }
    };
  }
}