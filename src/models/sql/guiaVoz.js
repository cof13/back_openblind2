const guiaVoz = (sequelize, type) => {
    return sequelize.define('guiasVoz', {
        idGuiaVoz: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreGuiaVoz: type.STRING,
        duracionGuiaVoz: type.INTEGER,
        estadoGuiaVoz: type.STRING,
        createGuiaVoz: type.STRING,
        updateGuiaVoz: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Guías de Voz'
    })
}
module.exports = guiaVoz;