const idioma = (sequelize, type) => {
    return sequelize.define('idiomas', {
        idIdioma: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreIdioma: type.STRING,
        codigoIdioma: type.STRING,
        estadoIdioma: type.STRING,
        createIdioma: type.STRING,
        updateIdioma: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Idiomas'
    })
}
module.exports = idioma;