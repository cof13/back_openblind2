const categoriaEstacion = (sequelize, type) => {
    return sequelize.define('categoriasEstacions', {
        idCategoriaEstacion: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreCategoriaEstacion: type.STRING,
        descripcionCategoriaEstacion: type.STRING,
        estadoCategoriaEstacion: type.STRING,
        createCategoriaEstacion: type.STRING,
        updateCategoriaEstacion: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Categorías de Estación'
    })
}
module.exports = categoriaEstacion;