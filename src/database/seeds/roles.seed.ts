import { DataSource } from 'typeorm';
import { Role } from '../../models/mysql/role.entity';
import { keys } from '../../config/keys';

const rolesData = [
  {
    nombre_rol: 'Super Administrador',
    descripcion: 'Acceso completo al sistema, puede gestionar todos los módulos y usuarios',
    estado: 'activo' as const,
  },
  {
    nombre_rol: 'Administrador',
    descripcion: 'Acceso administrativo al sistema, puede gestionar usuarios y contenido',
    estado: 'activo' as const,
  },
  {
    nombre_rol: 'Editor',
    descripcion: 'Puede crear y editar contenido del sistema como rutas, puntos turísticos y mensajes',
    estado: 'activo' as const,
  },
  {
    nombre_rol: 'Moderador',
    descripcion: 'Puede revisar y moderar contenido creado por usuarios',
    estado: 'activo' as const,
  },
  {
    nombre_rol: 'Usuario Premium',
    descripcion: 'Usuario con funcionalidades avanzadas y acceso prioritario',
    estado: 'activo' as const,
  },
  {
    nombre_rol: 'Usuario Estándar',
    descripcion: 'Usuario regular del sistema con acceso a funcionalidades básicas',
    estado: 'activo' as const,
  },
  {
    nombre_rol: 'Usuario Invitado',
    descripcion: 'Acceso limitado al sistema, solo lectura',
    estado: 'activo' as const,
  },
];

async function seedRoles() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: keys.MYSQL_HOST,
    port: keys.MYSQL_PORT,
    username: keys.MYSQL_USERNAME,
    password: keys.MYSQL_PASSWORD,
    database: keys.MYSQL_DATABASE,
    entities: [Role],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('📦 Conexión a la base de datos establecida');

    const roleRepository = dataSource.getRepository(Role);

    // Verificar si ya existen roles
    const existingRoles = await roleRepository.count();
    if (existingRoles > 0) {
      console.log('⚠️  Los roles ya existen en la base de datos');
      return;
    }

    // Insertar roles
    for (const roleData of rolesData) {
      const existingRole = await roleRepository.findOne({
        where: { nombre_rol: roleData.nombre_rol }
      });

      if (!existingRole) {
        const role = roleRepository.create(roleData);
        await roleRepository.save(role);
        console.log(`✅ Rol creado: ${roleData.nombre_rol}`);
      } else {
        console.log(`⏭️  Rol ya existe: ${roleData.nombre_rol}`);
      }
    }

    console.log('🎉 Seed de roles completado exitosamente');
  } catch (error) {
    console.error('❌ Error en seed de roles:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  seedRoles()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedRoles };