// scripts/init-roles.js
const mysql = require('mysql2/promise');

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USERNAME || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'openblind',
};

const roles = [
  {
    nombre_rol: 'Super Administrador',
    descripcion: 'Acceso completo al sistema, puede gestionar todos los módulos y usuarios',
    estado: 'activo',
  },
  {
    nombre_rol: 'Administrador',
    descripcion: 'Acceso administrativo al sistema, puede gestionar usuarios y contenido',
    estado: 'activo',
  },
  {
    nombre_rol: 'Editor',
    descripcion: 'Puede crear y editar contenido del sistema como rutas, puntos turísticos y mensajes',
    estado: 'activo',
  },
  {
    nombre_rol: 'Moderador',
    descripcion: 'Puede revisar y moderar contenido creado por usuarios',
    estado: 'activo',
  },
  {
    nombre_rol: 'Usuario Premium',
    descripcion: 'Usuario con funcionalidades avanzadas y acceso prioritario',
    estado: 'activo',
  },
  {
    nombre_rol: 'Usuario Estándar',
    descripcion: 'Usuario regular del sistema con acceso a funcionalidades básicas',
    estado: 'activo',
  },
  {
    nombre_rol: 'Usuario Invitado',
    descripcion: 'Acceso limitado al sistema, solo lectura',
    estado: 'activo',
  },
];

async function initRoles() {
  console.log('🚀 Iniciando inicialización de roles...');
  
  let connection;
  
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Conectado a MySQL');

    // Verificar si la tabla existe, si no, crearla
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS roles (
        id_rol INT AUTO_INCREMENT PRIMARY KEY,
        nombre_rol VARCHAR(50) NOT NULL UNIQUE,
        descripcion TEXT,
        estado ENUM('activo', 'inactivo') DEFAULT 'activo',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await connection.execute(createTableQuery);
    console.log('✅ Tabla roles verificada/creada');

    // Verificar roles existentes
    const [existingRoles] = await connection.execute('SELECT * FROM roles');
    
    if (existingRoles.length > 0) {
      console.log(`⚠️  Ya existen ${existingRoles.length} roles en la base de datos:`);
      existingRoles.forEach((role, index) => {
        console.log(`  ${index + 1}. ID: ${role.id_rol} - ${role.nombre_rol} (${role.estado})`);
      });
      return;
    }

    // Insertar roles
    console.log('📝 Insertando roles...');
    
    for (const role of roles) {
      try {
        const [result] = await connection.execute(
          'INSERT INTO roles (nombre_rol, descripcion, estado) VALUES (?, ?, ?)',
          [role.nombre_rol, role.descripcion, role.estado]
        );
        console.log(`  ✅ ${role.nombre_rol} creado con ID: ${result.insertId}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`  ⏭️  ${role.nombre_rol} ya existe`);
        } else {
          throw error;
        }
      }
    }

    // Mostrar resumen
    const [allRoles] = await connection.execute('SELECT * FROM roles ORDER BY id_rol');
    console.log('\n🎉 Roles inicializados correctamente!');
    console.log('\n📋 Resumen de roles:');
    allRoles.forEach((role) => {
      console.log(`  ID: ${role.id_rol} - ${role.nombre_rol} (${role.estado})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Verifica las credenciales de MySQL');
      console.error('   Usuario:', config.user);
      console.error('   Host:', config.host);
      console.error('   Puerto:', config.port);
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 La base de datos no existe. Créala primero:');
      console.error('   mysql -u root -p');
      console.error('   CREATE DATABASE openblind;');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 MySQL no está ejecutándose. Inicia el servicio MySQL');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

initRoles();