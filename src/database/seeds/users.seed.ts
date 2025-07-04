import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../models/mysql/user.entity';
import { Role } from '../../models/mysql/role.entity';
import { keys } from '../../config/keys';

const usersData = [
  {
    nombres: 'Super',
    apellidos: 'Administrador',
    email: 'super@openblind.com',
    password: 'SuperAdmin123!',
    telefono: '+593987654321',
    fecha_nacimiento: new Date('1990-01-01'),
    rol_nombre: 'Super Administrador',
    estado: 'activo' as const,
  },
  {
    nombres: 'Admin',
    apellidos: 'Sistema',
    email: 'admin@openblind.com',
    password: 'Admin123!',
    telefono: '+593987654322',
    fecha_nacimiento: new Date('1985-05-15'),
    rol_nombre: 'Administrador',
    estado: 'activo' as const,
  },
  {
    nombres: 'Editor',
    apellidos: 'Contenido',
    email: 'editor@openblind.com',
    password: 'Editor123!',
    telefono: '+593987654323',
    fecha_nacimiento: new Date('1992-08-20'),
    rol_nombre: 'Editor',
    estado: 'activo' as const,
  },
  {
    nombres: 'María',
    apellidos: 'González',
    email: 'maria.gonzalez@openblind.com',
    password: 'User123!',
    telefono: '+593987654324',
    fecha_nacimiento: new Date('1988-12-03'),
    rol_nombre: 'Usuario Premium',
    estado: 'activo' as const,
  },
  {
    nombres: 'Juan',
    apellidos: 'Pérez',
    email: 'juan.perez@openblind.com',
    password: 'User123!',
    telefono: '+593987654325',
    fecha_nacimiento: new Date('1995-03-18'),
    rol_nombre: 'Usuario Estándar',
    estado: 'activo' as const,
  },
];

async function seedUsers() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: keys.MYSQL_HOST,
    port: keys.MYSQL_PORT,
    username: keys.MYSQL_USERNAME,
    password: keys.MYSQL_PASSWORD,
    database: keys.MYSQL_DATABASE,
    entities: [User, Role],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('📦 Conexión a la base de datos establecida');

    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);

    // Verificar si ya existen usuarios
    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      console.log('⚠️  Los usuarios ya existen en la base de datos');
      return;
    }

    // Obtener todos los roles para mapeo
    const roles = await roleRepository.find();
    const roleMap = new Map(roles.map(role => [role.nombre_rol, role.id_rol]));

    // Insertar usuarios
    for (const userData of usersData) {
      const existingUser = await userRepository.findOne({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const roleId = roleMap.get(userData.rol_nombre);
        if (!roleId) {
          console.error(`❌ Rol no encontrado: ${userData.rol_nombre}`);
          continue;
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        const user = userRepository.create({
          nombres: userData.nombres,
          apellidos: userData.apellidos,
          email: userData.email,
          password: hashedPassword,
          telefono: userData.telefono,
          fecha_nacimiento: userData.fecha_nacimiento,
          id_rol: roleId,
          estado: userData.estado,
        });

        await userRepository.save(user);
        console.log(`✅ Usuario creado: ${userData.email} (${userData.rol_nombre})`);
      } else {
        console.log(`⏭️  Usuario ya existe: ${userData.email}`);
      }
    }

    console.log('🎉 Seed de usuarios completado exitosamente');
  } catch (error) {
    console.error('❌ Error en seed de usuarios:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  seedUsers()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedUsers };
