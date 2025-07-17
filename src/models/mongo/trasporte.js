const mongoose = require('mongoose')

const transporteSchema = new mongoose.Schema({
    caracteristicasTransporte: {
        aireAcondicionado: Boolean,
        wifi: Boolean,
        accesibilidad: Boolean,
        capacidadEspecial: Boolean
    },
    mantenimientoTransporte: [{
        fecha: Date,
        tipo: String,
        descripcion: String,
        costo: Number
    }],
    combustibleTransporte: {
        tipo: String,
        consumoPromedio: Number,
        capacidadTanque: Number
    },
    fotosTransporte: [String],
    especificacionesTecnicas: {
        motor: String,
        transmision: String,
        peso: Number,
        dimensiones: {
            largo: Number,
            ancho: Number,
            alto: Number
        }
    },
    idTransporteSql: String,
}, {
    timestamps: true
});

const transporte = mongoose.model('transportes', transporteSchema);
module.exports = transporte;