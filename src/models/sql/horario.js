const horario = (sequelize, type) => {
    return sequelize.define('horarios', {
        idHorario: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        horaInicio: type.TIME,
        horaFin: type.TIME,
        diasSemana: type.STRING,
        estadoHorario: type.STRING,
        createHorario: type.STRING,
        updateHorario: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Horarios'
    })
}
module.exports = horario;