# OpenBlind Backend API

Sistema backend para OpenBlind - Aplicación de navegación accesible para personas con discapacidad visual.

## 🚀 Características

- **Arquitectura Híbrida**: MySQL para datos relacionales + MongoDB para datos no relacionales
- **CRUD Completo**: Gestión de usuarios, roles, rutas, estaciones y puntos turísticos
- **Autenticación JWT**: Sistema seguro de autenticación y autorización
- **Validación Robusta**: Validación de datos con class-validator
- **API RESTful**: Endpoints bien estructurados siguiendo mejores prácticas
- **Documentación Swagger**: API auto-documentada
- **Docker Support**: Contenedorización completa para desarrollo y producción
- **TypeScript**: Código fuertemente tipado

## 📋 Prerequisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- MySQL >= 8.0
- MongoDB >= 6.0
- Docker & Docker Compose (opcional)

## 🛠️ Instalación

### Opción 1: Instalación Local

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd open-back
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar bases de datos**
```bash
# MySQL
mysql -u root -p
CREATE DATABASE openblind;

# MongoDB se conecta automáticamente
```

5. **Ejecutar seeds**
```bash
npm run seed:all
```

6. **Iniciar la aplicación**
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

### Opción 2: Instalación con Docker

1. **Iniciar servicios**
```bash
# Desarrollo
npm run docker:dev

# Producción
npm run docker:prod
```

2. **Ejecutar seeds**
```bash
npm run seed:all
```

## 📚 Estructura del Proyecto

```
src/
├── common/                 # Utilidades compartidas
│   ├── decorators/         # Decoradores personalizados
│   ├── filters/           # Filtros de excepción
│   ├── guards/            # Guards de autenticación/autorización
│   ├── interceptors/      # Interceptores
│   ├── pipes/             # Pipes personalizados
│   └── utils/             # Utilidades
├── config/                # Configuraciones
│   ├── database.mongo.ts  # Configuración MongoDB
│   ├── database.orm.ts    # Configuración MySQL/TypeORM
│   └── keys.ts           # Variables de entorno
├── database/              # Base de datos
│   ├── migrations/        # Migraciones SQL
│   └── seeds/            # Seeds de datos iniciales
├── models/                # Modelos de datos
│   ├── mongodb/          # Esquemas MongoDB
│   └── mysql/            # Entidades TypeORM
├── modules/               # Módulos de funcionalidad
│   ├── role/             # Gestión de roles
│   └── user/             # Gestión de usuarios
├── app.module.ts         # Módulo principal
└── main.ts              # Punto de entrada
```

## 🗃️ Base de Datos

### MySQL (Datos Relacionales)
- **usuarios**: Información básica de usuarios
- **roles**: Roles del sistema
- **rutas**: Rutas de transporte
- **estaciones**: Estaciones de transporte
- **puntos_turisticos**: Puntos de interés
- **mensajes_personalizados**: Mensajes de navegación
- **guias_voz**: Archivos de audio

### MongoDB (Datos No Relacionales)
- **user_profiles**: Perfiles detallados de usuario
- **route_details**: Detalles extendidos de rutas
- **message_contents**: Contenido multiidioma de mensajes
- **location_history**: Historial de ubicaciones
- **search_history**: Historial de búsquedas

## 🔐 Sistema de Roles

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Super Administrador** | Acceso total al sistema | Todos |
| **Administrador** | Gestión administrativa | Usuarios, contenido, configuración |
| **Editor** | Creación de contenido | Rutas, mensajes, puntos turísticos |
| **Moderador** | Moderación de contenido | Revisar, aprobar contenido |
| **Usuario Premium** | Usuario con funciones avanzadas | Funciones premium |
| **Usuario Estándar** | Usuario regular | Funciones básicas |
| **Usuario Invitado** | Acceso limitado | Solo lectura |

## 📡 API Endpoints

### Autenticación
```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
```

### Usuarios
```
GET    /api/v1/users           # Listar usuarios
POST   /api/v1/users           # Crear usuario
GET    /api/v1/users/:id       # Obtener usuario
PATCH  /api/v1/users/:id       # Actualizar usuario
DELETE /api/v1/users/:id       # Eliminar usuario
GET    /api/v1/users/active    # Usuarios activos
GET    /api/v1/users/:id/profile # Perfil completo
PATCH  /api/v1/users/:id/profile # Actualizar perfil
PATCH  /api/v1/users/:id/change-password # Cambiar contraseña
```

### Roles
```
GET    /api/v1/roles           # Listar roles
POST   /api/v1/roles           # Crear rol
GET    /api/v1/roles/:id       # Obtener rol
PATCH  /api/v1/roles/:id       # Actualizar rol
DELETE /api/v1/roles/:id       # Eliminar rol
GET    /api/v1/roles/active    # Roles activos
GET    /api/v1/roles/:id/users # Usuarios por rol
```

## 💾 Scripts de Base de Datos

```bash
# Migraciones
npm run migration:generate -- --name=MigrationName
npm run migration:run
npm run migration:revert

# Seeds
npm run seed:roles      # Crear roles iniciales
npm run seed:users      # Crear usuarios iniciales
npm run seed:all        # Ejecutar todos los seeds

# Esquema
npm run schema:drop     # Eliminar esquema
npm run schema:sync     # Sincronizar esquema

# Reset completo
npm run db:reset        # Drop + Migrate + Seed
```

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# Base de datos MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=openblind

# Base de datos MongoDB
MONGO_URI=mongodb://localhost:27017/openblind

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Aplicación
PORT=3000
NODE_ENV=development
API_PREFIX=api/v1

# Seguridad
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=*

# Archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con watch
npm run test:watch

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📦 Docker

### Desarrollo
```bash
# Iniciar servicios
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Servicios Incluidos
- **MySQL 8.0**: Puerto 3306
- **MongoDB 7.0**: Puerto 27017
- **phpMyAdmin**: Puerto 8080
- **Mongo Express**: Puerto 8081

## 🚀 Deployment

### Producción
```bash
# Build
npm run build

# Iniciar
npm run start:prod

# Con Docker
docker-compose -f docker-compose.prod.yml up -d
```

### Consideraciones de Producción
- Configurar `NODE_ENV=production`
- Usar migraciones en lugar de `synchronize`
- Configurar SSL para bases de datos
- Implementar rate limiting
- Configurar logs centralizados
- Usar variables de entorno seguras

## 📋 Usuarios de Prueba

Después de ejecutar los seeds, tendrás estos usuarios disponibles:

| Email | Contraseña | Rol |
|-------|------------|-----|
| super@openblind.com | SuperAdmin123! | Super Administrador |
| admin@openblind.com | Admin123! | Administrador |
| editor@openblind.com | Editor123! | Editor |
| maria.gonzalez@openblind.com | User123! | Usuario Premium |
| juan.perez@openblind.com | User123! | Usuario Estándar |

## 🔗 Enlaces Útiles

- **API Docs**: http://localhost:3000/api/v1/docs (Swagger)
- **phpMyAdmin**: http://localhost:8080
- **Mongo Express**: http://localhost:8081

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Notas de Desarrollo

### Validación de Contraseñas
- Mínimo 8 caracteres
- Al menos 1 minúscula
- Al menos 1 mayúscula
- Al menos 1 número
- Al menos 1 carácter especial

### Paginación Estándar
- Default: 10 elementos por página
- Máximo: 100 elementos por página
- Respuesta incluye metadatos de paginación

### Formato de Respuestas
```json
{
  "success": true,
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Manejo de Errores
```json
{
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/users",
  "method": "POST",
  "message": "Error message",
  "error": {}
}
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **Backend Developer**: [Tu Nombre]
- **Database Architect**: [Nombre]
- **DevOps Engineer**: [Nombre]

## 📞 Soporte

Para soporte técnico, contactar:
- Email: support@openblind.com
- Issues: [GitHub Issues](link-to-issues)

---

**Versión**: 0.0.1  
**Última actualización**: Enero 2024