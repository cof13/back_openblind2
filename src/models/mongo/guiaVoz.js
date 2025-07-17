const mongoose = require('mongoose')

const guiaVozSchema = new mongoose.Schema({
    audioGuia: {
        url: String,
        formato: String,
        duracion: Number,
        tamaño: Number,
        calidad: String
    },
    transcripcionGuia: String,
    idiomaGuia: String,
    categoriaGuia: String,
    fotoGuia: String,
    descripcionGuia: String,
    tagsGuia: [String],
    nivelDificultad: String,
    duracionEstimada: Number,
    requisitosGuia: [String],
    estadisticasGuia: {
        reproducciones: Number,
        descargas: Number,
        calificacionPromedio: Number,
        totalCalificaciones: Number
    },
    idMensajeSql: String,
    idGuiaVozSql: String,
}, {
    timestamps: true
});
const guiaVoz = mongoose.model('guiasVoz', guiaVozSchema);
module.exports = guiaVoz;