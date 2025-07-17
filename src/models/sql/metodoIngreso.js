const metodoIngreso = (sequelize, type) => {
    return sequelize.define('metodosIngresos', {
        idMetodoIngreso: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreMetodo: type.STRING,
        descripcionMetodo: type.STRING,
        estadoMetodo: type.STRING,
        createMetodo: type.STRING,
        updateMetodo: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Métodos de Ingreso'
    })
}

module.exports = metodoIngreso;