// src/database/seeds/roles.seed.ts (Corregido)
import { DataSource } from 'typeorm';
import { Role } from '../../models/mysql/role.entity';
import { User } from '../../models/mysql/user.entity';
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
  console.log('🚀 Iniciando seed de roles...');
  
  const dataSource = new DataSource({
    type: 'mysql',
    host: keys.MYSQL_HOST,
    port: keys.MYSQL_PORT,
    username: keys.MYSQL_USERNAME,
    password: keys.MYSQL_PASSWORD,
    database: keys.MYSQL_DATABASE,
    entities: [Role, User], // Incluir ambas entidades para evitar errores de relación
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conexión a MySQL establecida');

    const roleRepository = dataSource.getRepository(Role);

    // Verificar si ya existen roles
    const existingRoles = await roleRepository.count();
    if (existingRoles > 0) {
      console.log(`⚠️  Ya existen ${existingRoles} roles en la base de datos`);
      
      // Mostrar roles existentes
      const currentRoles = await roleRepository.find();
      console.log('\n📋 Roles existentes:');
      currentRoles.forEach((role, index) => {
        console.log(`  ${index + 1}. ID: ${role.id_rol} - ${role.nombre_rol} (${role.estado})`);
      });
      
      return;
    }

    // Crear roles
    console.log('📝 Creando roles...');
    for (const roleData of rolesData) {
      const existingRole = await roleRepository.findOne({
        where: { nombre_rol: roleData.nombre_rol }
      });

      if (!existingRole) {
        const role = roleRepository.create(roleData);
        const savedRole = await roleRepository.save(role);
        console.log(`  ✅ ${roleData.nombre_rol} creado con ID: ${savedRole.id_rol}`);
      } else {
        console.log(`  ⏭️  ${roleData.nombre_rol} ya existe`);
      }
    }

    console.log('\n🎉 Seed de roles completado exitosamente!');
    
    // Mostrar resumen final
    const allRoles = await roleRepository.find();
    console.log('\n📋 Resumen de roles en la base de datos:');
    allRoles.forEach((role) => {
      console.log(`  ID: ${role.id_rol} - ${role.nombre_rol} (${role.estado})`);
    });

  } catch (error) {
    console.error('❌ Error en seed de roles:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Verifica las credenciales de MySQL en tu archivo .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 La base de datos no existe. Créala primero:');
      console.error('   mysql -u root -p');
      console.error('   CREATE DATABASE openblind;');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 MySQL no está ejecutándose. Inicia el servicio MySQL');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('💡 La tabla roles no existe. Ejecuta primero la aplicación para crear las tablas');
      console.error('   npm run start:dev');
    }
    
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  seedRoles()
    .then(() => {
      console.log('✅ Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

export { seedRoles };