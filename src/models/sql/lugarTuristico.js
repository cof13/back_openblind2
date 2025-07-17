const lugarTuristico = (sequelize, type) => {
    return sequelize.define('lugaresTuristicos', {
        idLugarTuristico: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreLugar: type.STRING,
        codigoLugar: type.STRING,
        estadoLugar: type.STRING,
        createLugar: type.STRING,
        updateLugar: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Lugares Turísticos'
    })
}
module.exports = lugarTuristico;