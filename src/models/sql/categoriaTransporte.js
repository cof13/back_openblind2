const categoriaTransporte = (sequelize, type) => {
    return sequelize.define('categoriasTransportes', {
        idCategoriaTransporte: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreCategoria: type.STRING,
        descripcionCategoria: type.STRING,
        estadoCategoria: type.STRING,
        createCategoria: type.STRING,
        updateCategoria: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Categorías de Transporte'
    })
}

module.exports = categoriaTransporte;