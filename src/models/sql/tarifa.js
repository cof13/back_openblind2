const tarifa = (sequelize, type) => {
    return sequelize.define('tarifas', {
        idTarifa: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreTarifa: type.STRING,
        montoTarifa: type.DECIMAL(10,2),
        tipoTarifa: type.STRING,
        estadoTarifa: type.STRING,
        createTarifa: type.STRING,
        updateTarifa: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Tarifas'
    })
}
module.exports = tarifa;