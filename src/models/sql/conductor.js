const conductor = (sequelize, type) => {
    return sequelize.define('conductores', {
        idConductor: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreConductor: type.STRING,
        cedulaConductor: type.STRING,
        licenciaConductor: type.STRING,
        estadoConductor: type.STRING,
        createConductor: type.STRING,
        updateConductor: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Conductores'
    })
}
module.exports = conductor;