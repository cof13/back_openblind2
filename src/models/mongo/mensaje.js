const mongoose = require('mongoose')

const mensajeSchema = new mongoose.Schema({
    descripcionMensaje: String,
    contenidoMensaje: String,
    fechaPublicacion: Date,
    fechaExpiracion: Date,
    audienciaObjetivo: {
        usuarios: [String],
        roles: [String],
        ubicaciones: [String]
    },
    multimedia: {
        imagenes: [String],
        videos: [String],
        documentos: [String]
    },
    configuracionMensaje: {
        urgente: Boolean,
        notificacionPush: Boolean,
        notificacionEmail: Boolean,
        mostrarEnPantalla: Boolean
    },
    estadisticasMensaje: {
        visto: Number,
        leido: Number,
        compartido: Number
    },
    idMensajeSql: String,
}, {
    timestamps: true
});
const mensaje = mongoose.model('mensajes', mensajeSchema);
module.exports = mensaje;