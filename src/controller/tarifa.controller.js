const tarifaCtl = {};
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

// Obtener tarifas por ruta
tarifaCtl.obtenerPorRuta = async (req, res) => {
    try {
        const { rutaId } = req.params;

        const [tarifasRuta] = await sql.promise().query(`
            SELECT t.*, r.nombreRuta
            FROM tarifas t
            JOIN rutas r ON t.rutaIdRuta = r.idRuta
            WHERE t.rutaIdRuta = ? AND t.estadoTarifa = "activo"
        `, [rutaId]);

        const tarifasCompletas = tarifasRuta.map(tarifa => ({
            ...tarifa,
            nombreRuta: descifrarSeguro(tarifa.nombreRuta)
        }));

        return res.json(tarifasCompletas);
    } catch (error) {
        console.error('Error al obtener tarifas:', error);
        return res.status(500).json({ message: 'Error al obtener tarifas', error: error.message });
    }
};

// Calcular tarifa dinámica
tarifaCtl.calcularTarifa = async (req, res) => {
    try {
        const { rutaId, tipoUsuario, estacionOrigen, estacionDestino } = req.body;

        // Obtener tarifa base de la ruta
        const [tarifaBase] = await sql.promise().query(
            'SELECT * FROM tarifas WHERE rutaIdRuta = ? AND tipoTarifa = "base" AND estadoTarifa = "activo"',
            [rutaId]
        );

        if (tarifaBase.length === 0) {
            return res.status(404).json({ message: 'Tarifa no encontrada para esta ruta' });
        }

        let montoFinal = tarifaBase[0].montoTarifa;

        // Aplicar descuentos según tipo de usuario
        const descuentos = {
            'estudiante': 0.5,
            'tercera_edad': 0.4,
            'discapacitado': 0.3,
            'regular': 1.0
        };

        montoFinal = montoFinal * (descuentos[tipoUsuario] || 1.0);

        // Si hay estaciones específicas, calcular distancia
        if (estacionOrigen && estacionDestino) {
            const [distancia] = await sql.promise().query(`
                SELECT ABS(eo.ordenEstacion - ed.ordenEstacion) as distanciaEstaciones
                FROM rutaEstaciones eo, rutaEstaciones ed
                WHERE eo.rutaIdRuta = ? AND ed.rutaIdRuta = ?
                AND eo.estacionIdEstacion = ? AND ed.estacionIdEstacion = ?
            `, [rutaId, rutaId, estacionOrigen, estacionDestino]);

            if (distancia.length > 0 && distancia[0].distanciaEstaciones > 0) {
                // Ajustar tarifa según distancia (opcional)
                montoFinal = montoFinal * (1 + distancia[0].distanciaEstaciones * 0.1);
            }
        }

        return res.json({
            rutaId,
            tipoUsuario,
            tarifaBase: tarifaBase[0].montoTarifa,
            montoFinal: Math.round(montoFinal * 100) / 100,
            descuentoAplicado: descuentos[tipoUsuario] || 1.0
        });

    } catch (error) {
        console.error('Error al calcular tarifa:', error);
        return res.status(500).json({ message: 'Error al calcular tarifa', error: error.message });
    }
};

// Crear nueva tarifa
tarifaCtl.crearTarifa = async (req, res) => {
    try {
        const { rutaIdRuta, tipoTarifa, montoTarifa } = req.body;

        // Validación de campos requeridos
        if (!rutaIdRuta || !tipoTarifa || !montoTarifa) {
            return res.status(400).json({ message: 'Datos básicos de la tarifa son obligatorios' });
        }

        // Crear en SQL
        const [resultado] = await sql.promise().query(`
            INSERT INTO tarifas (rutaIdRuta, tipoTarifa, montoTarifa, estadoTarifa, createTarifa)
            VALUES (?, ?, ?, 'activo', ?)
        `, [rutaIdRuta, tipoTarifa, montoTarifa, new Date().toLocaleString()]);

        return res.status(201).json({ 
            message: 'Tarifa creada exitosamente',
            idTarifa: resultado.insertId
        });

    } catch (error) {
        console.error('Error al crear tarifa:', error);
        return res.status(500).json({ 
            message: 'Error al crear la tarifa', 
            error: error.message 
        });
    }
};

// Actualizar tarifa
tarifaCtl.actualizarTarifa = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipoTarifa, montoTarifa } = req.body;

        // Validar campos
        if (!tipoTarifa || !montoTarifa) {
            return res.status(400).json({ message: 'Datos básicos son obligatorios' });
        }

        // Actualizar en SQL
        await sql.promise().query(
            `UPDATE tarifas SET 
                tipoTarifa = ?, 
                montoTarifa = ?, 
                updateTarifa = ? 
             WHERE idTarifa = ?`,
            [
                tipoTarifa,
                montoTarifa,
                new Date().toLocaleString(),
                id
            ]
        );

        return res.json({ message: 'Tarifa actualizada exitosamente' });

    } catch (error) {
        console.error('Error al actualizar tarifa:', error);
        return res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
};

// Eliminar (desactivar) tarifa
tarifaCtl.eliminarTarifa = async (req, res) => {
    try {
        const { id } = req.params;

        await sql.promise().query(
            `UPDATE tarifas SET 
                estadoTarifa = 'inactivo', 
                updateTarifa = ? 
             WHERE idTarifa = ?`,
            [new Date().toLocaleString(), id]
        );

        return res.json({ message: 'Tarifa desactivada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar tarifa:', error);
        return res.status(500).json({ message: 'Error al desactivar', error: error.message });
    }
};

module.exports = tarifaCtl;
