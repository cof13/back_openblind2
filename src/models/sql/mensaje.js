const mensaje = (sequelize, type) => {
    return sequelize.define('mensajes', {
        idMensaje: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreMensaje: type.STRING,
        estadoMensaje: type.STRING,
        prioridadMensaje: type.INTEGER,
        createMensaje: type.STRING,
        updateMensaje: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Mensajes'
    })
}
module.exports = mensaje;