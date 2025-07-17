const rutaEstacion = (sequelize, type) => {
    return sequelize.define('rutaEstaciones', {
        idRutaEstacion: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ordenEstacion: type.INTEGER,
        tiempoEstimado: type.INTEGER,
        createRutaEstacion: type.STRING,
        updateRutaEstacion: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla relación Ruta-Estación'
    })
}
module.exports = rutaEstacion;