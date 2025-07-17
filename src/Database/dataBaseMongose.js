const mongoose = require('mongoose');
const { MONGODB_URI } = require('../keys');

// 1. Configuración de eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose conectado a MongoDB en:', mongoose.connection.host);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de conexión en Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose desconectado de MongoDB');
});

// 2. Función de conexión mejorada
const connectDB = async () => {
  try {
    // Codificar contraseña por si contiene caracteres especiales
    const encodedPassword = encodeURIComponent('0987021692@Rj');
    const connectionURI = MONGODB_URI.replace('<PASSWORD>', encodedPassword);

    await mongoose.connect(connectionURI, {
      connectTimeoutMS: 10000, // 10 segundos de timeout
      socketTimeoutMS: 45000, // 45 segundos
    });
    
    console.log('🚀 MongoDB conectado correctamente');
  } catch (err) {
    console.error('💥 FALLA CRÍTICA en conexión MongoDB:', err.message);
    process.exit(1); // Termina la aplicación con error
  }
};

// 3. Manejo de cierre de aplicación
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada por terminación de la app');
    process.exit(0);
  } catch (err) {
    console.error('Error al cerrar conexión MongoDB:', err);
    process.exit(1);
  }
});

// 4. Iniciar conexión inmediatamente (como solicitaste)
connectDB();

// 5. Exportar modelos (ajusta las rutas según tu estructura)
const pageModel = require('../models/mongo/page');
const calificacionModel = require('../models/mongo/calificacion');
const clienteModel = require('../models/mongo/cliente');
const conductorModel = require('../models/mongo/conductor');
const estacionModel = require('../models/mongo/estacion');
const guiaVozModel = require('../models/mongo/guiaVoz');
const lugarTuristicoModel = require('../models/mongo/lugarTuristico');
const mensajeModel = require('../models/mongo/mensaje');
const rutaModel = require('../models/mongo/ruta');
const transporteModel = require('../models/mongo/trasporte');


module.exports = {
  pageModel,
  calificacionModel,
  clienteModel,
  conductorModel,
  estacionModel,
  guiaVozModel,
  lugarTuristicoModel,
  mensajeModel,
  rutaModel,
  transporteModel
};