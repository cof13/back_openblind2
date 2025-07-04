export const ERROR_MESSAGES = {
  // Usuarios
  USER_NOT_FOUND: 'Usuario no encontrado',
  USER_ALREADY_EXISTS: 'El usuario ya existe',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  PASSWORD_TOO_WEAK: 'La contraseña no cumple con los requisitos de seguridad',
  EMAIL_ALREADY_REGISTERED: 'El email ya está registrado',
  
  // Roles
  ROLE_NOT_FOUND: 'Rol no encontrado',
  ROLE_ALREADY_EXISTS: 'El rol ya existe',
  ROLE_HAS_USERS: 'No se puede eliminar el rol porque tiene usuarios asignados',
  ROLE_INACTIVE: 'El rol está inactivo',
  
  // Validaciones generales
  VALIDATION_ERROR: 'Error de validación',
  REQUIRED_FIELD: 'Este campo es requerido',
  INVALID_FORMAT: 'Formato inválido',
  INVALID_DATE: 'Fecha inválida',
  
  // Errores de servidor
  INTERNAL_SERVER_ERROR: 'Error interno del servidor',
  DATABASE_CONNECTION_ERROR: 'Error de conexión a la base de datos',
  
  // Autorización
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
  TOKEN_EXPIRED: 'Token expirado',
  
  // MongoDB
  MONGO_CONNECTION_ERROR: 'Error de conexión a MongoDB',
  PROFILE_NOT_FOUND: 'Perfil de usuario no encontrado',
  PROFILE_CREATION_ERROR: 'Error al crear el perfil de usuario',
} as const;
