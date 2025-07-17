const mongoose = require('mongoose')

const lugarTuristicoSchema = new mongoose.Schema({
    descripcionLugar: String,
    ubicacionLugar: {
        latitud: Number,
        longitud: Number,
        direccion: String,
        codigoPostal: String,
        ciudad: String,
        pais: String
    },
    referenciasLugar: [String],
    imagenesLugar: [String],
    videosLugar: [String],
    horariosLugar: [{
        diaSemana: String,
        horaApertura: String,
        horaCierre: String
    }],
    tarifasLugar: {
        adulto: Number,
        niño: Number,
        estudiante: Number,
        tercerEdad: Number,
        gratuito: Boolean
    },
    serviciosLugar: {
        guiaTuristica: Boolean,
        audioGuia: Boolean,
        tiendaSouvenirs: Boolean,
        restaurante: Boolean,
        estacionamiento: Boolean,
        wifi: Boolean
    },
    contactoLugar: {
        telefono: String,
        email: String,
        sitioWeb: String,
        redesSociales: {
            facebook: String,
            instagram: String,
            twitter: String
        }
    },
    reseñasLugar: [{
        usuario: String,
        calificacion: Number,
        comentario: String,
        fecha: Date
    }],
    idLugarSql: String,
}, {
    timestamps: true
});
const lugarTuristico = mongoose.model('lugaresTuristicos', lugarTuristicoSchema);
module.exports = lugarTuristico;