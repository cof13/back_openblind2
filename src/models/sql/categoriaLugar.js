const categoriaLugar = (sequelize, type) => {
    return sequelize.define('categoriasLugars', {
        idCategoriaLugar: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreCategoriaLugar: type.STRING,
        descripcionCategoriaLugar: type.STRING,
        estadoCategoriaLugar: type.STRING,
        createCategoriaLugar: type.STRING,
        updateCategoriaLugar: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Categorías de Lugar'
    })
}
module.exports = categoriaLugar;