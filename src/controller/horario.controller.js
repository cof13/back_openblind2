const horarioCtl = {};
const sql = require('../Database/dataBase.sql');
const { cifrarDatos, descifrarDatos } = require('../lib/encrypDates');

// Función para descifrar de forma segura
const descifrarSeguro = (dato) => {
    try {
        return dato ? descifrarDatos(dato) : '';
    } catch (error) {
        console.error('Error al descifrar:', error);
        return '';
    }
};

// Obtener horarios por ruta
horarioCtl.obtenerPorRuta = async (req, res) => {
    try {
        const { rutaId } = req.params;

        const [horariosRuta] = await sql.promise().query(`
            SELECT h.*, r.nombreRuta
            FROM horarios h
            JOIN rutas r ON h.rutaIdRuta = r.idRuta
            WHERE h.rutaIdRuta = ? AND h.estadoHorario = "activo"
            ORDER BY h.horaInicio
        `, [rutaId]);

        const horariosCompletos = horariosRuta.map(horario => ({
            ...horario,
            nombreRuta: descifrarSeguro(horario.nombreRuta)
        }));

        return res.json(horariosCompletos);
    } catch (error) {
        console.error('Error al obtener horarios:', error);
        return res.status(500).json({ message: 'Error al obtener horarios', error: error.message });
    }
};

// Crear nuevo horario
horarioCtl.crearHorario = async (req, res) => {
    try {
        const { rutaIdRuta, horaInicio, horaFin } = req.body;

        // Validación de campos requeridos
        if (!rutaIdRuta || !horaInicio || !horaFin) {
            return res.status(400).json({ message: 'Datos básicos del horario son obligatorios' });
        }

        // Crear en SQL
        const nuevoHorario = await sql.promise().query(`
            INSERT INTO horarios (rutaIdRuta, horaInicio, horaFin, estadoHorario, createHorario)
            VALUES (?, ?, ?, 'activo', ?)
        `, [rutaIdRuta, horaInicio, horaFin, new Date().toLocaleString()]);

        return res.status(201).json({ 
            message: 'Horario creado exitosamente',
            idHorario: nuevoHorario.insertId
        });

    } catch (error) {
        console.error('Error al crear horario:', error);
        return res.status(500).json({ 
            message: 'Error al crear el horario', 
            error: error.message 
        });
    }
};

// Actualizar horario
horarioCtl.actualizarHorario = async (req, res) => {
    try {
        const { id } = req.params;
        const { horaInicio, horaFin } = req.body;

        // Validar campos
        if (!horaInicio || !horaFin) {
            return res.status(400).json({ message: 'Datos básicos son obligatorios' });
        }

        // Actualizar en SQL
        await sql.promise().query(
            `UPDATE horarios SET 
                horaInicio = ?, 
                horaFin = ?, 
                updateHorario = ? 
             WHERE idHorario = ?`,
            [
                horaInicio,
                horaFin,
                new Date().toLocaleString(),
                id
            ]
        );

        return res.json({ message: 'Horario actualizado exitosamente' });

    } catch (error) {
        console.error('Error al actualizar horario:', error);
        return res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
};

// Eliminar (desactivar) horario
horarioCtl.eliminarHorario = async (req, res) => {
    try {
        const { id } = req.params;

        await sql.promise().query(
            `UPDATE horarios SET 
                estadoHorario = 'inactivo', 
                updateHorario = ? 
             WHERE idHorario = ?`,
            [new Date().toLocaleString(), id]
        );

        return res.json({ message: 'Horario desactivado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar horario:', error);
        return res.status(500).json({ message: 'Error al desactivar', error: error.message });
    }
};

module.exports = horarioCtl;
