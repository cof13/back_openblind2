const estacionMetodo = (sequelize, type) => {
    return sequelize.define('estacionMetodos', {
        idEstacionMetodo: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        createEstacionMetodo: type.STRING,
        updateEstacionMetodo: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla relación Estación-Método'
    })
}
module.exports = estacionMetodo;