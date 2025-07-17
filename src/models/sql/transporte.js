const transporte = (sequelize, type) => {
    return sequelize.define('transportes', {
        idTransporte: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        tipoTransporte: type.STRING,
        capacidadTransporte: type.INTEGER,
        placaTransporte: type.STRING,
        modeloTransporte: type.STRING,
        marcaTransporte: type.STRING,
        estadoTransporte: type.STRING,
        createTransporte: type.STRING,
        updateTransporte: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Transportes'
    })
}

module.exports = transporte;