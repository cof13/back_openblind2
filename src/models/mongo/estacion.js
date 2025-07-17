const mongoose = require('mongoose')

const estacionSchema = new mongoose.Schema({
    ubicacionEstacion: {
        latitud: Number,
        longitud: Number,
        direccion: String,
        codigoPostal: String,
        ciudad: String,
        pais: String
    },
    horariosDetallados: [{
        diaSemana: String,
        horaApertura: String,
        horaCierre: String,
        horariosEspeciales: [{
            fecha: Date,
            horaApertura: String,
            horaCierre: String,
            motivo: String
        }]
    }],
    serviciosEstacion: {
        baños: Boolean,
        cajeros: Boolean,
        tiendas: Boolean,
        restaurantes: Boolean,
        estacionamiento: Boolean,
        wifi: Boolean
    },
    accesibilidadEstacion: {
        rampaAcceso: Boolean,
        ascensor: Boolean,
        señalizacionBraille: Boolean,
        audioGuia: Boolean
    },
    fotosEstacion: [String],
    contactoEstacion: {
        telefono: String,
        email: String,
        encargado: String
    },
    idEstacionSql: String,
}, {
    timestamps: true
});
const estacion = mongoose.model('estaciones', estacionSchema);
module.exports = estacion;