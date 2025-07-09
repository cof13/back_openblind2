// src/modules/role/role.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from '../modules/role/dto/create-role.dto';
import { UpdateRoleDto } from '../modules/role/dto/update-role.dto';
import { Role } from '../models/mysql/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Verificar si ya existe un rol con el mismo nombre
    const existingRole = await this.roleRepository.findOne({
      where: { nombre_rol: createRoleDto.nombre_rol }
    });

    if (existingRole) {
      throw new ConflictException(`El rol '${createRoleDto.nombre_rol}' ya existe`);
    }

    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find({
      order: { fecha_creacion: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id_rol: id },
      relations: ['users']
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // Si se está actualizando el nombre, verificar que no exista otro rol con ese nombre
    if (updateRoleDto.nombre_rol && updateRoleDto.nombre_rol !== role.nombre_rol) {
      const existingRole = await this.roleRepository.findOne({
        where: { nombre_rol: updateRoleDto.nombre_rol }
      });

      if (existingRole) {
        throw new ConflictException(`El rol '${updateRoleDto.nombre_rol}' ya existe`);
      }
    }

    Object.assign(role, updateRoleDto);
    return await this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id_rol: id },
      relations: ['users']
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    if (role.users && role.users.length > 0) {
      throw new ConflictException(`No se puede eliminar el rol porque tiene ${role.users.length} usuarios asignados`);
    }

    await this.roleRepository.remove(role);
  }

  async findActiveRoles(): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { estado: 'activo' },
      order: { nombre_rol: 'ASC' }
    });
  }

  async getUsersByRole(roleId: number) {
    const role = await this.roleRepository.findOne({
      where: { id_rol: roleId },
      relations: ['users']
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${roleId} no encontrado`);
    }

    return role.users;
  }
}
