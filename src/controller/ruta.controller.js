const rutaCtl = {};
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

// Mostrar todas las rutas activas
rutaCtl.mostrarRutas = async (req, res) => {
    try {
        const [listaRutas] = await sql.promise().query(`
            SELECT r.* 
            FROM rutas r
            WHERE r.estadoRuta = "activo"
        `);
        
        const rutasCompletas = await Promise.all(
            listaRutas.map(async (ruta) => {
                // Obtener datos adicionales de MongoDB
                const rutaMongo = await mongo.rutaModel.findOne({ 
                    idRutaSql: ruta.idRuta 
                });

                // Obtener estaciones de la ruta
                const [estacionesRuta] = await sql.promise().query(`
                    SELECT e.*, re.ordenEstacion, re.tiempoEstimado
                    FROM rutaEstaciones re
                    JOIN estaciones e ON re.estacionIdEstacion = e.idEstacion
                    WHERE re.rutaIdRuta = ?
                    ORDER BY re.ordenEstacion
                `, [ruta.idRuta]);

                // Obtener transportes asignados
                const [transportes] = await sql.promise().query(`
                    SELECT t.*, ct.nombreCategoria
                    FROM transportes t
                    LEFT JOIN categoriasTransportes ct ON t.categoriaTransporteIdCategoriaTransporte = ct.idCategoriaTransporte
                    WHERE t.rutaIdRuta = ? AND t.estadoTransporte = "activo"
                `, [ruta.idRuta]);

                return {
                    ...ruta,
                    nombreRuta: descifrarSeguro(ruta.nombreRuta),
                    codigoRuta: descifrarSeguro(ruta.codigoRuta),
                    estaciones: estacionesRuta.map(est => ({
                        ...est,
                        nombreEstacion: descifrarSeguro(est.nombreEstacion)
                    })),
                    transportes: transportes,
                    detallesMongo: rutaMongo ? {
                        ubicacion: rutaMongo.ubicacionRuta,
                        horarios: rutaMongo.horariosRuta,
                        distancia: rutaMongo.distanciaRuta,
                        tiempoPromedio: rutaMongo.tiempoPromedioRuta,
                        tarifa: rutaMongo.tarifaRuta,
                        observaciones: rutaMongo.observacionesRuta
                    } : null
                };
            })
        );

        return res.json(rutasCompletas);
    } catch (error) {
        console.error('Error al mostrar rutas:', error);
        return res.status(500).json({ message: 'Error al obtener las rutas', error: error.message });
    }
};

// Crear nueva ruta
rutaCtl.crearRuta = async (req, res) => {
    try {
        const { 
            nombreRuta, codigoRuta, estaciones,
            ubicacion, horarios, distancia, tiempoPromedio, tarifa, observaciones
        } = req.body;

        // Validación de campos requeridos
        if (!nombreRuta || !estaciones || estaciones.length < 2) {
            return res.status(400).json({ message: 'Nombre y al menos 2 estaciones son obligatorios' });
        }

        // Crear en SQL
        const nuevaRuta = await orm.ruta.create({
            nombreRuta: cifrarDatos(nombreRuta),
            codigoRuta: cifrarDatos(codigoRuta || ''),
            estadoRuta: 'activo',
            createRuta: new Date().toLocaleString(),
        });

        // Crear relaciones con estaciones
        for (let i = 0; i < estaciones.length; i++) {
            await orm.rutaEstacion.create({
                rutaIdRuta: nuevaRuta.idRuta,
                estacionIdEstacion: estaciones[i].idEstacion,
                ordenEstacion: i + 1,
                tiempoEstimado: estaciones[i].tiempoEstimado || 0,
                createRutaEstacion: new Date().toLocaleString()
            });
        }

        // Crear en MongoDB con datos adicionales
        if (ubicacion || horarios || distancia || tiempoPromedio || tarifa || observaciones) {
            await mongo.rutaModel.create({
                ubicacionRuta: ubicacion || {},
                horariosRuta: horarios || [],
                distanciaRuta: distancia || 0,
                tiempoPromedioRuta: tiempoPromedio || 0,
                tarifaRuta: tarifa || {},
                observacionesRuta: observaciones || '',
                idRutaSql: nuevaRuta.idRuta
            });
        }

        return res.status(201).json({ 
            message: 'Ruta creada exitosamente',
            idRuta: nuevaRuta.idRuta
        });

    } catch (error) {
        console.error('Error al crear ruta:', error);
        return res.status(500).json({ 
            message: 'Error al crear la ruta', 
            error: error.message 
        });
    }
};

// Actualizar ruta
rutaCtl.actualizarRuta = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            nombreRuta, codigoRuta, estaciones,
            ubicacion, horarios, distancia, tiempoPromedio, tarifa, observaciones
        } = req.body;

        // Validar campos
        if (!nombreRuta) {
            return res.status(400).json({ message: 'Nombre de ruta es obligatorio' });
        }

        // Actualizar en SQL
        await sql.promise().query(
            `UPDATE rutas SET 
                nombreRuta = ?, 
                codigoRuta = ?, 
                updateRuta = ? 
             WHERE idRuta = ?`,
            [
                cifrarDatos(nombreRuta),
                cifrarDatos(codigoRuta || ''),
                new Date().toLocaleString(),
                id
            ]
        );

        // Actualizar estaciones si se proporcionan
        if (estaciones && estaciones.length >= 2) {
            // Eliminar relaciones existentes
            await sql.promise().query(
                'DELETE FROM rutaEstaciones WHERE rutaIdRuta = ?',
                [id]
            );
            
            // Crear nuevas relaciones
            for (let i = 0; i < estaciones.length; i++) {
                await orm.rutaEstacion.create({
                    rutaIdRuta: id,
                    estacionIdEstacion: estaciones[i].idEstacion,
                    ordenEstacion: i + 1,
                    tiempoEstimado: estaciones[i].tiempoEstimado || 0,
                    createRutaEstacion: new Date().toLocaleString()
                });
            }
        }

        // Actualizar en MongoDB
        if (ubicacion || horarios || distancia || tiempoPromedio || tarifa || observaciones) {
            await mongo.rutaModel.updateOne(
                { idRutaSql: id },
                {
                    $set: {
                        ubicacionRuta: ubicacion || {},
                        horariosRuta: horarios || [],
                        distanciaRuta: distancia || 0,
                        tiempoPromedioRuta: tiempoPromedio || 0,
                        tarifaRuta: tarifa || {},
                        observacionesRuta: observaciones || ''
                    }
                }
            );
        }

        return res.json({ message: 'Ruta actualizada exitosamente' });

    } catch (error) {
        console.error('Error al actualizar ruta:', error);
        return res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
};

// Eliminar (desactivar) ruta
rutaCtl.eliminarRuta = async (req, res) => {
    try {
        const { id } = req.params;

        await sql.promise().query(
            `UPDATE rutas SET 
                estadoRuta = 'inactivo', 
                updateRuta = ? 
             WHERE idRuta = ?`,
            [new Date().toLocaleString(), id]
        );

        return res.json({ message: 'Ruta desactivada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar ruta:', error);
        return res.status(500).json({ message: 'Error al desactivar', error: error.message });
    }
};

// Obtener ruta por ID
rutaCtl.obtenerRuta = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [ruta] = await sql.promise().query(
            'SELECT * FROM rutas WHERE idRuta = ? AND estadoRuta = "activo"',
            [id]
        );

        if (ruta.length === 0) {
            return res.status(404).json({ message: 'Ruta no encontrada' });
        }

        const rutaMongo = await mongo.rutaModel.findOne({ 
            idRutaSql: id 
        });

        // Obtener estaciones de la ruta
        const [estacionesRuta] = await sql.promise().query(`
            SELECT e.*, re.ordenEstacion, re.tiempoEstimado
            FROM rutaEstaciones re
            JOIN estaciones e ON re.estacionIdEstacion = e.idEstacion
            WHERE re.rutaIdRuta = ?
            ORDER BY re.ordenEstacion
        `, [id]);

        const rutaCompleta = {
            ...ruta[0],
            nombreRuta: descifrarSeguro(ruta[0].nombreRuta),
            codigoRuta: descifrarSeguro(ruta[0].codigoRuta),
            estaciones: estacionesRuta.map(est => ({
                ...est,
                nombreEstacion: descifrarSeguro(est.nombreEstacion)
            })),
            detallesMongo: rutaMongo || null
        };

        return res.json(rutaCompleta);
    } catch (error) {
        console.error('Error al obtener ruta:', error);
        return res.status(500).json({ message: 'Error al obtener ruta', error: error.message });
    }
};

// Buscar rutas que pasen por una estación específica
rutaCtl.buscarPorEstacion = async (req, res) => {
    try {
        const { idEstacion } = req.params;

        const [rutasConEstacion] = await sql.promise().query(`
            SELECT DISTINCT r.*, re.ordenEstacion
            FROM rutas r
            JOIN rutaEstaciones re ON r.idRuta = re.rutaIdRuta
            WHERE re.estacionIdEstacion = ? AND r.estadoRuta = "activo"
        `, [idEstacion]);

        const rutasCompletas = await Promise.all(
            rutasConEstacion.map(async (ruta) => {
                const rutaMongo = await mongo.rutaModel.findOne({ 
                    idRutaSql: ruta.idRuta 
                });

                return {
                    ...ruta,
                    nombreRuta: descifrarSeguro(ruta.nombreRuta),
                    codigoRuta: descifrarSeguro(ruta.codigoRuta),
                    detallesMongo: rutaMongo ? {
                        horarios: rutaMongo.horariosRuta,
                        tarifa: rutaMongo.tarifaRuta
                    } : null
                };
            })
        );

        return res.json(rutasCompletas);
    } catch (error) {
        console.error('Error al buscar rutas por estación:', error);
        return res.status(500).json({ message: 'Error en la búsqueda', error: error.message });
    }
};

module.exports = rutaCtl;