const tipoMensaje = (sequelize, type) => {
    return sequelize.define('tiposMensajes', {
        idTipoMensaje: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreTipoMensaje: type.STRING,
        descripcionTipoMensaje: type.STRING,
        estadoTipoMensaje: type.STRING,
        createTipoMensaje: type.STRING,
        updateTipoMensaje: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Tipos de Mensaje'
    })
}
module.exports = tipoMensaje;