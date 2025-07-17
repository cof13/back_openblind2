const estacion = (sequelize, type) => {
    return sequelize.define('estaciones', {
        idEstacion: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreEstacion: type.STRING,
        codigoEstacion: type.STRING,
        numeroEntradas: type.INTEGER,
        estadoEstacion: type.STRING,
        createEstacion: type.STRING,
        updateEstacion: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Estaciones'
    })
}
module.exports = estacion;