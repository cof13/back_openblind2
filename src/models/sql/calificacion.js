const calificacion = (sequelize, type) => {
    return sequelize.define('calificaciones', {
        idCalificacion: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        puntajeCalificacion: type.DECIMAL(3,2),
        tipoCalificacion: type.STRING,
        estadoCalificacion: type.STRING,
        createCalificacion: type.STRING,
        updateCalificacion: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Calificaciones'
    })
}
module.exports = calificacion;