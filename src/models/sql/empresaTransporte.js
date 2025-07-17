const empresaTransporte = (sequelize, type) => {
    return sequelize.define('empresasTransporte', {
        idEmpresaTransporte: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreEmpresa: type.STRING,
        rucEmpresa: type.STRING,
        telefonoEmpresa: type.STRING,
        estadoEmpresa: type.STRING,
        createEmpresa: type.STRING,
        updateEmpresa: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Empresas de Transporte'
    })
}

module.exports = empresaTransporte;