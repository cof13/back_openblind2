const ruta = (sequelize, type) => {
    return sequelize.define('rutas', {
        idRuta: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreRuta: type.STRING,
        codigoRuta: type.STRING,
        estadoRuta: type.STRING,
        createRuta: type.STRING,
        updateRuta: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Rutas'
    })
}
module.exports = ruta;