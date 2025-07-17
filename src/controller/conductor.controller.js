const conductorCtl = {};
const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');
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

// Mostrar conductores activos
conductorCtl.mostrarConductores = async (req, res) => {
    try {
        const [listaConductores] = await sql.promise().query(`
            select * from conductores c
            WHERE c.estadoConductor = "activo"
        `);
        
        const conductoresCompletos = await Promise.all(
            listaConductores.map(async (conductor) => {
                const conductorMongo = await mongo.conductorModel.findOne({ 
                    idConductorSql: conductor.idConductor 
                });

                // Obtener transportes asignados
                const [transportes] = await sql.promise().query(
                    'SELECT * FROM transportes WHERE conductoreIdConductor = ? AND estadoTransporte = "activo"',
                    [conductor.idConductor]
                );

                // Obtener calificación promedio
                const [calificacion] = await sql.promise().query(
                    'SELECT AVG(puntajeCalificacion) as promedio FROM calificaciones WHERE conductoreIdConductor = ? AND estadoCalificacion = "activo"',
                    [conductor.idConductor]
                );

                return {
                    ...conductor,
                    nombreConductor: descifrarSeguro(conductor.nombreConductor),
                    cedulaConductor: descifrarSeguro(conductor.cedulaConductor),
                    licenciaConductor: descifrarSeguro(conductor.licenciaConductor),
                    usuarioRegistro: descifrarSeguro(conductor.usuarioRegistro),
                    transportesAsignados: transportes.length,
                    calificacionPromedio: calificacion[0].promedio || 0,
                    detallesMongo: conductorMongo || null
                };
            })
        );

        return res.json(conductoresCompletos);
    } catch (error) {
        console.error('Error al mostrar conductores:', error);
        return res.status(500).json({ message: 'Error al obtener conductores', error: error.message });
    }
};

// Crear nuevo conductor con encriptación
conductorCtl.crearConductor = async (req, res) => {
    try {
        const { nombreConductor, cedulaConductor, licenciaConductor, usuarioIdUsuario } = req.body;

        // Validación de campos requeridos
        if (!nombreConductor || !cedulaConductor || !licenciaConductor || !usuarioIdUsuario) {
            return res.status(400).json({ message: 'Datos básicos del conductor son obligatorios' });
        }

        // Crear en SQL con datos encriptados
        const nuevoConductor = await orm.conductor.create({
            nombreConductor: cifrarDatos(nombreConductor),
            cedulaConductor: cifrarDatos(cedulaConductor),
            licenciaConductor: cifrarDatos(licenciaConductor),
            estadoConductor: 'activo',
            usuarioIdUsuario,
            createConductor: new Date().toLocaleString(),
        });

        return res.status(201).json({ 
            message: 'Conductor creado exitosamente',
            idConductor: nuevoConductor.idConductor
        });

    } catch (error) {
        console.error('Error al crear conductor:', error);
        return res.status(500).json({ 
            message: 'Error al crear el conductor', 
            error: error.message 
        });
    }
};

// Actualizar conductor con encriptación
conductorCtl.actualizarConductor = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreConductor, cedulaConductor, licenciaConductor } = req.body;

        // Validar campos
        if (!nombreConductor || !cedulaConductor || !licenciaConductor) {
            return res.status(400).json({ message: 'Datos básicos son obligatorios' });
        }

        // Actualizar en SQL (datos principales)
        await sql.promise().query(
            `UPDATE conductores SET 
                nombreConductor = ?, 
                cedulaConductor = ?, 
                licenciaConductor = ?, 
                updateConductor = ? 
             WHERE idConductor = ?`,
            [
                cifrarDatos(nombreConductor),
                cifrarDatos(cedulaConductor),
                cifrarDatos(licenciaConductor),
                new Date().toLocaleString(),
                id
            ]
        );

        return res.json({ message: 'Conductor actualizado exitosamente' });

    } catch (error) {
        console.error('Error al actualizar conductor:', error);
        return res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
};

// Eliminar (desactivar) conductor
conductorCtl.eliminarConductor = async (req, res) => {
    try {
        const { id } = req.params;

        await sql.promise().query(
            `UPDATE conductores SET 
                estadoConductor = 'inactivo', 
                updateConductor = ? 
             WHERE idConductor = ?`,
            [new Date().toLocaleString(), id]
        );

        return res.json({ message: 'Conductor desactivado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar conductor:', error);
        return res.status(500).json({ message: 'Error al desactivar', error: error.message });
    }
};

module.exports = conductorCtl;
