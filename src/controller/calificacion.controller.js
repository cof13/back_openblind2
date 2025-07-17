const calificacionCtl = {};
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

// Mostrar todas las calificaciones activas
calificacionCtl.mostrarCalificaciones = async (req, res) => {
    try {
        const [listaCalificaciones] = await sql.promise().query(`
            SELECT c.*, u.nombreUsuario,
                   t.placaTransporte, con.nombreConductor, r.nombreRuta, 
                   e.nombreEstacion, lt.nombreLugar, gv.nombreGuiaVoz
            FROM calificaciones c
            LEFT JOIN usuarios u ON c.usuarioIdUsuario = u.idUsuario
            LEFT JOIN transportes t ON c.transporteIdTransporte = t.idTransporte
            LEFT JOIN conductores con ON c.conductorIdConductor = con.idConductor
            LEFT JOIN rutas r ON c.rutaIdRuta = r.idRuta
            LEFT JOIN estaciones e ON c.estacionIdEstacion = e.idEstacion
            LEFT JOIN lugaresTuristicos lt ON c.lugarTuristicoIdLugarTuristico = lt.idLugarTuristico
            LEFT JOIN guiasVoz gv ON c.guiaVozIdGuiaVoz = gv.idGuiaVoz
            WHERE c.estadoCalificacion = "activo"
            ORDER BY c.createCalificacion DESC
        `);
        
        const calificacionesCompletas = await Promise.all(
            listaCalificaciones.map(async (calificacion) => {
                // Obtener datos adicionales de MongoDB
                const calificacionMongo = await mongo.calificacionModel.findOne({ 
                    idCalificacionSql: calificacion.idCalificacion 
                });

                return {
                    ...calificacion,
                    nombreUsuario: descifrarSeguro(calificacion.nombreUsuario),
                    placaTransporte: descifrarSeguro(calificacion.placaTransporte),
                    nombreConductor: descifrarSeguro(calificacion.nombreConductor),
                    nombreRuta: descifrarSeguro(calificacion.nombreRuta),
                    nombreEstacion: descifrarSeguro(calificacion.nombreEstacion),
                    nombreLugar: descifrarSeguro(calificacion.nombreLugar),
                    nombreGuiaVoz: descifrarSeguro(calificacion.nombreGuiaVoz),
                    detallesMongo: calificacionMongo ? {
                        detalle: calificacionMongo.detalleCalificacion,
                        comentario: calificacionMongo.comentarioCalificacion,
                        fecha: calificacionMongo.fechaCalificacion,
                        aspectos: calificacionMongo.aspectosCalificacion,
                        recomendaria: calificacionMongo.recomendaria,
                        experienciaPrevia: calificacionMongo.experienciaPrevia,
                        ubicacion: calificacionMongo.ubicacionCalificacion,
                        multimedia: calificacionMongo.multimediaCalificacion
                    } : null
                };
            })
        );

        return res.json(calificacionesCompletas);
    } catch (error) {
        console.error('Error al mostrar calificaciones:', error);
        return res.status(500).json({ message: 'Error al obtener las calificaciones', error: error.message });
    }
};

// Crear nueva calificación
calificacionCtl.crearCalificacion = async (req, res) => {
    try {
        const { 
            puntajeCalificacion, tipoCalificacion, usuarioId,
            transporteId, conductorId, rutaId, estacionId, lugarTuristicoId, guiaVozId,
            detalle, comentario, aspectos, recomendaria, experienciaPrevia, 
            ubicacion, multimedia
        } = req.body;

        // Validación de campos requeridos
        if (!puntajeCalificacion || !tipoCalificacion || !usuarioId) {
            return res.status(400).json({ message: 'Puntaje, tipo y usuario son obligatorios' });
        }

        if (puntajeCalificacion < 1 || puntajeCalificacion > 5) {
            return res.status(400).json({ message: 'El puntaje debe estar entre 1 y 5' });
        }

        // Crear en SQL
        const nuevaCalificacion = await orm.calificacion.create({
            puntajeCalificacion,
            tipoCalificacion,
            estadoCalificacion: 'activo',
            usuarioIdUsuario: usuarioId,
            transporteIdTransporte: transporteId,
            conductorIdConductor: conductorId,
            rutaIdRuta: rutaId,
            estacionIdEstacion: estacionId,
            lugarTuristicoIdLugarTuristico: lugarTuristicoId,
            guiaVozIdGuiaVoz: guiaVozId,
            createCalificacion: new Date().toLocaleString(),
        });

        // Crear en MongoDB con datos adicionales
        if (detalle || comentario || aspectos || ubicacion || multimedia) {
            await mongo.calificacionModel.create({
                detalleCalificacion: detalle || '',
                comentarioCalificacion: comentario || '',
                fechaCalificacion: new Date(),
                usuarioCalificacion: usuarioId,
                aspectosCalificacion: aspectos || {
                    puntualidad: 0,
                    limpieza: 0,
                    comodidad: 0,
                    atencion: 0,
                    seguridad: 0
                },
                recomendaria: recomendaria || false,
                experienciaPrevia: experienciaPrevia || false,
                ubicacionCalificacion: ubicacion || {},
                multimediaCalificacion: multimedia || { fotos: [], videos: [] },
                idCalificacionSql: nuevaCalificacion.idCalificacion
            });
        }

        return res.status(201).json({ 
            message: 'Calificación creada exitosamente',
            idCalificacion: nuevaCalificacion.idCalificacion
        });

    } catch (error) {
        console.error('Error al crear calificación:', error);
        return res.status(500).json({ 
            message: 'Error al crear la calificación', 
            error: error.message 
        });
    }
};

// Actualizar calificación
calificacionCtl.actualizarCalificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            puntajeCalificacion, tipoCalificacion,
            detalle, comentario, aspectos, recomendaria, experienciaPrevia,
            ubicacion, multimedia
        } = req.body;

        // Validar campos
        if (!puntajeCalificacion || !tipoCalificacion) {
            return res.status(400).json({ message: 'Puntaje y tipo son obligatorios' });
        }

        if (puntajeCalificacion < 1 || puntajeCalificacion > 5) {
            return res.status(400).json({ message: 'El puntaje debe estar entre 1 y 5' });
        }

        // Actualizar en SQL
        await sql.promise().query(
            `UPDATE calificaciones SET 
                puntajeCalificacion = ?, 
                tipoCalificacion = ?, 
                updateCalificacion = ? 
             WHERE idCalificacion = ?`,
            [
                puntajeCalificacion,
                tipoCalificacion,
                new Date().toLocaleString(),
                id
            ]
        );

        // Actualizar en MongoDB
        if (detalle || comentario || aspectos || ubicacion || multimedia) {
            await mongo.calificacionModel.updateOne(
                { idCalificacionSql: id },
                {
                    $set: {
                        detalleCalificacion: detalle || '',
                        comentarioCalificacion: comentario || '',
                        aspectosCalificacion: aspectos || {},
                        recomendaria: recomendaria || false,
                        experienciaPrevia: experienciaPrevia || false,
                        ubicacionCalificacion: ubicacion || {},
                        multimediaCalificacion: multimedia || {}
                    }
                }
            );
        }

        return res.json({ message: 'Calificación actualizada exitosamente' });

    } catch (error) {
        console.error('Error al actualizar calificación:', error);
        return res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
};

// Eliminar (desactivar) calificación
calificacionCtl.eliminarCalificacion = async (req, res) => {
    try {
        const { id } = req.params;

        await sql.promise().query(
            `UPDATE calificaciones SET 
                estadoCalificacion = 'inactivo', 
                updateCalificacion = ? 
             WHERE idCalificacion = ?`,
            [new Date().toLocaleString(), id]
        );

        return res.json({ message: 'Calificación desactivada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar calificación:', error);
        return res.status(500).json({ message: 'Error al desactivar', error: error.message });
    }
};

// Obtener calificación por ID
calificacionCtl.obtenerCalificacion = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [calificacion] = await sql.promise().query(`
            SELECT c.*, u.nombreUsuario
            FROM calificaciones c
            LEFT JOIN usuarios u ON c.usuarioIdUsuario = u.idUsuario
            WHERE c.idCalificacion = ? AND c.estadoCalificacion = "activo"
        `, [id]);

        if (calificacion.length === 0) {
            return res.status(404).json({ message: 'Calificación no encontrada' });
        }

        const calificacionMongo = await mongo.calificacionModel.findOne({ 
            idCalificacionSql: id 
        });

        const calificacionCompleta = {
            ...calificacion[0],
            nombreUsuario: descifrarSeguro(calificacion[0].nombreUsuario),
            detallesMongo: calificacionMongo || null
        };

        return res.json(calificacionCompleta);
    } catch (error) {
        console.error('Error al obtener calificación:', error);
        return res.status(500).json({ message: 'Error al obtener calificación', error: error.message });
    }
};

// Obtener calificaciones por transporte
calificacionCtl.obtenerPorTransporte = async (req, res) => {
    try {
        const { transporteId } = req.params;

        const [calificacionesPorTransporte] = await sql.promise().query(`
            SELECT c.*, u.nombreUsuario
            FROM calificaciones c
            LEFT JOIN usuarios u ON c.usuarioIdUsuario = u.idUsuario
            WHERE c.transporteIdTransporte = ? AND c.estadoCalificacion = "activo"
            ORDER BY c.createCalificacion DESC
        `, [transporteId]);

        const calificacionesCompletas = await Promise.all(
            calificacionesPorTransporte.map(async (calificacion) => {
                const calificacionMongo = await mongo.calificacionModel.findOne({ 
                    idCalificacionSql: calificacion.idCalificacion 
                });

                return {
                    ...calificacion,
                    nombreUsuario: descifrarSeguro(calificacion.nombreUsuario),
                    detallesMongo: calificacionMongo ? {
                        detalle: calificacionMongo.detalleCalificacion,
                        comentario: calificacionMongo.comentarioCalificacion,
                        aspectos: calificacionMongo.aspectosCalificacion,
                        fecha: calificacionMongo.fechaCalificacion
                    } : null
                };
            })
        );

        // Calcular promedio
        const promedio = calificacionesCompletas.length > 0 
            ? calificacionesCompletas.reduce((sum, cal) => sum + cal.puntajeCalificacion, 0) / calificacionesCompletas.length
            : 0;

        return res.json({
            calificaciones: calificacionesCompletas,
            promedio: promedio.toFixed(2),
            total: calificacionesCompletas.length
        });
    } catch (error) {
        console.error('Error al obtener calificaciones por transporte:', error);
        return res.status(500).json({ message: 'Error en la búsqueda', error: error.message });
    }
};

// Obtener calificaciones por conductor
calificacionCtl.obtenerPorConductor = async (req, res) => {
    try {
        const { conductorId } = req.params;

        const [calificacionesPorConductor] = await sql.promise().query(`
            SELECT c.*, u.nombreUsuario
            FROM calificaciones c
            LEFT JOIN usuarios u ON c.usuarioIdUsuario = u.idUsuario
            WHERE c.conductorIdConductor = ? AND c.estadoCalificacion = "activo"
            ORDER BY c.createCalificacion DESC
        `, [conductorId]);

        const calificacionesCompletas = await Promise.all(
            calificacionesPorConductor.map(async (calificacion) => {
                const calificacionMongo = await mongo.calificacionModel.findOne({ 
                    idCalificacionSql: calificacion.idCalificacion 
                });

                return {
                    ...calificacion,
                    nombreUsuario: descifrarSeguro(calificacion.nombreUsuario),
                    detallesMongo: calificacionMongo || null
                };
            })
        );

        // Calcular promedio y estadísticas de aspectos
        let promedioGeneral = 0;
        let promedioAspectos = { puntualidad: 0, limpieza: 0, comodidad: 0, atencion: 0, seguridad: 0 };
        
        if (calificacionesCompletas.length > 0) {
            promedioGeneral = calificacionesCompletas.reduce((sum, cal) => sum + cal.puntajeCalificacion, 0) / calificacionesCompletas.length;
            
            // Calcular promedio de aspectos específicos
            const aspectosValidos = calificacionesCompletas.filter(cal => cal.detallesMongo && cal.detallesMongo.aspectosCalificacion);
            if (aspectosValidos.length > 0) {
                Object.keys(promedioAspectos).forEach(aspecto => {
                    promedioAspectos[aspecto] = aspectosValidos.reduce((sum, cal) => 
                        sum + (cal.detallesMongo.aspectosCalificacion[aspecto] || 0), 0) / aspectosValidos.length;
                });
            }
        }

        return res.json({
            calificaciones: calificacionesCompletas,
            promedio: promedioGeneral.toFixed(2),
            promedioAspectos: promedioAspectos,
            total: calificacionesCompletas.length
        });
    } catch (error) {
        console.error('Error al obtener calificaciones por conductor:', error);
        return res.status(500).json({ message: 'Error en la búsqueda', error: error.message });
    }
};

// Obtener calificaciones por lugar turístico
calificacionCtl.obtenerPorLugar = async (req, res) => {
    try {
        const { lugarId } = req.params;

        const [calificacionesPorLugar] = await sql.promise().query(`
            SELECT c.*, u.nombreUsuario
            FROM calificaciones c
            LEFT JOIN usuarios u ON c.usuarioIdUsuario = u.idUsuario
            WHERE c.lugarTuristicoIdLugarTuristico = ? AND c.estadoCalificacion = "activo"
            ORDER BY c.createCalificacion DESC
        `, [lugarId]);

        const calificacionesCompletas = await Promise.all(
            calificacionesPorLugar.map(async (calificacion) => {
                const calificacionMongo = await mongo.calificacionModel.findOne({ 
                    idCalificacionSql: calificacion.idCalificacion 
                });

                return {
                    ...calificacion,
                    nombreUsuario: descifrarSeguro(calificacion.nombreUsuario),
                    detallesMongo: calificacionMongo || null
                };
            })
        );

        // Calcular promedio
        const promedio = calificacionesCompletas.length > 0 
            ? calificacionesCompletas.reduce((sum, cal) => sum + cal.puntajeCalificacion, 0) / calificacionesCompletas.length
            : 0;

        return res.json({
            calificaciones: calificacionesCompletas,
            promedio: promedio.toFixed(2),
            total: calificacionesCompletas.length
        });
    } catch (error) {
        console.error('Error al obtener calificaciones por lugar:', error);
        return res.status(500).json({ message: 'Error en la búsqueda', error: error.message });
    }
};

// Obtener estadísticas generales de calificaciones
calificacionCtl.obtenerEstadisticas = async (req, res) => {
    try {
        // Estadísticas por tipo
        const [estadisticasPorTipo] = await sql.promise().query(`
            SELECT 
                tipoCalificacion,
                COUNT(*) as total,
                AVG(puntajeCalificacion) as promedio
            FROM calificaciones 
            WHERE estadoCalificacion = "activo"
            GROUP BY tipoCalificacion
        `);

        // Estadísticas generales
        const [estadisticasGenerales] = await sql.promise().query(`
            SELECT 
                COUNT(*) as totalCalificaciones,
                AVG(puntajeCalificacion) as promedioGeneral,
                MIN(puntajeCalificacion) as minimo,
                MAX(puntajeCalificacion) as maximo
            FROM calificaciones 
            WHERE estadoCalificacion = "activo"
        `);

        // Distribución de puntajes
        const [distribucionPuntajes] = await sql.promise().query(`
            SELECT 
                puntajeCalificacion,
                COUNT(*) as cantidad
            FROM calificaciones 
            WHERE estadoCalificacion = "activo"
            GROUP BY puntajeCalificacion
            ORDER BY puntajeCalificacion
        `);

        return res.json({
            estadisticasPorTipo,
            estadisticasGenerales: estadisticasGenerales[0],
            distribucionPuntajes
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
    }
};

// Obtener calificaciones recientes
calificacionCtl.obtenerRecientes = async (req, res) => {
    try {
        const { limite = 10 } = req.query;

        const [calificacionesRecientes] = await sql.promise().query(`
            SELECT c.*, u.nombreUsuario,
                   CASE 
                       WHEN c.transporteIdTransporte IS NOT NULL THEN 'Transporte'
                       WHEN c.conductorIdConductor IS NOT NULL THEN 'Conductor'
                       WHEN c.rutaIdRuta IS NOT NULL THEN 'Ruta'
                       WHEN c.estacionIdEstacion IS NOT NULL THEN 'Estación'
                       WHEN c.lugarTuristicoIdLugarTuristico IS NOT NULL THEN 'Lugar Turístico'
                       WHEN c.guiaVozIdGuiaVoz IS NOT NULL THEN 'Guía de Voz'
                       ELSE 'Otro'
                   END as tipoEntidad
            FROM calificaciones c
            LEFT JOIN usuarios u ON c.usuarioIdUsuario = u.idUsuario
            WHERE c.estadoCalificacion = "activo"
            ORDER BY c.createCalificacion DESC
            LIMIT ?
        `, [parseInt(limite)]);

        const calificacionesCompletas = await Promise.all(
            calificacionesRecientes.map(async (calificacion) => {
                const calificacionMongo = await mongo.calificacionModel.findOne({ 
                    idCalificacionSql: calificacion.idCalificacion 
                });

                return {
                    ...calificacion,
                    nombreUsuario: descifrarSeguro(calificacion.nombreUsuario),
                    detallesMongo: calificacionMongo ? {
                        comentario: calificacionMongo.comentarioCalificacion,
                        fecha: calificacionMongo.fechaCalificacion
                    } : null
                };
            })
        );

        return res.json(calificacionesCompletas);
    } catch (error) {
        console.error('Error al obtener calificaciones recientes:', error);
        return res.status(500).json({ message: 'Error al obtener calificaciones recientes', error: error.message });
    }
};

module.exports = calificacionCtl;