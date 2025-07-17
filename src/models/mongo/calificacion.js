const mongoose = require('mongoose')

const calificacionSchema = new mongoose.Schema({
    detalleCalificacion: String,
    comentarioCalificacion: String,
    fechaCalificacion: Date,
    usuarioCalificacion: String,
    aspectosCalificacion: {
        puntualidad: Number,
        limpieza: Number,
        comodidad: Number,
        atencion: Number,
        seguridad: Number
    },
    recomendaria: Boolean,
    experienciaPrevia: Boolean,
    ubicacionCalificacion: {
        latitud: Number,
        longitud: Number
    },
    multimediaCalificacion: {
        fotos: [String],
        videos: [String]
    },
    idCalificacionSql: String,
}, {
    timestamps: true
});

const Calificacion = mongoose.model('Calificacion', calificacionSchema);
module.exports = Calificacion;