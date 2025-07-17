const mongoose = require('mongoose')

const rutaSchema = new mongoose.Schema({
    ubicacionRuta: {
        puntoInicio: {
            latitud: Number,
            longitud: Number,
            direccion: String
        },
        puntoFin: {
            latitud: Number,
            longitud: Number,
            direccion: String
        },
        puntosIntermedios: [{
            latitud: Number,
            longitud: Number,
            direccion: String,
            orden: Number
        }]
    },
    horariosRuta: [{
        diaSemana: String,
        frecuencia: Number,
        horaInicio: String,
        horaFin: String,
        intervalos: [String]
    }],
    distanciaRuta: Number,
    tiempoPromedioRuta: Number,
    tarifaRuta: {
        regular: Number,
        estudiante: Number,
        tercerEdad: Number,
        discapacitado: Number
    },
    observacionesRuta: String,
    idRutaSql: String,
}, {
    timestamps: true
});

const ruta = mongoose.model('rutas', rutaSchema);
module.exports = ruta;