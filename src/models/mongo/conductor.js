const mongoose = require('mongoose')

const conductorSchema = new mongoose.Schema({
    fotoConductor: String,
    experienciaConductor: Number,
    certificacionesConductor: [String],
    historialConductor: [{
        fecha: Date,
        evento: String,
        descripcion: String,
        gravedad: String
    }],
    calificacionPromedio: Number,
    comentariosConductor: [{
        usuario: String,
        comentario: String,
        calificacion: Number,
        fecha: Date
    }],
    contactoEmergencia: {
        nombre: String,
        telefono: String,
        relacion: String
    },
    idConductorSql: String,
}, {
    timestamps: true
});
const conductor = mongoose.model('conductores', conductorSchema);
module.exports = conductor;