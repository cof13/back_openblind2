const guiaVozCtl = {};
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

// Mostrar todas las guías de voz activas
guiaVozCtl.mostrarGuias = async (req, res) => {
    try {
        const [listaGuias] = await sql.promise().query(`
            SELECT gv.*, m.nombreMensaje, i.nombreIdioma, lt.nombreLugar, u.nombreUsuario
            FROM guiasVoz gv
            LEFT JOIN mensajes m ON gv.mensajeIdMensaje = m.idMensaje
            LEFT JOIN idiomas i ON gv.idiomaIdIdioma = i.idIdioma
            LEFT JOIN lugaresTuristicos lt ON gv.lugarTuristicoIdLugarTuristico = lt.idLugarTuristico
            LEFT JOIN usuarios u ON gv.usuarioIdUsuario = u.idUsuario
            WHERE gv.estadoGuiaVoz = "activo"
            ORDER BY gv.createGuiaVoz DESC
        `);
        
        const guiasCompletas = await Promise.all(
            listaGuias.map(async (guia) => {
                // Obtener datos adicionales de MongoDB
                const guiaMongo = await mongo.guiaVozModel.findOne({ 
                    idGuiaVozSql: guia.idGuiaVoz 
                });

                return {
                    ...guia,
                    nombreGuiaVoz: descifrarSeguro(guia.nombreGuiaVoz),
                    nombreMensaje: descifrarSeguro(guia.nombreMensaje),
                    nombreLugar: descifrarSeguro(guia.nombreLugar),
                    nombreUsuario: descifrarSeguro(guia.nombreUsuario),
                    detallesMongo: guiaMongo ? {
                        audio: guiaMongo.audioGuia,
                        transcripcion: guiaMongo.transcripcionGuia,
                        idioma: guiaMongo.idiomaGuia,
                        categoria: guiaMongo.categoriaGuia,
                        foto: guiaMongo.fotoGuia,
                        descripcion: guiaMongo.descripcionGuia,
                        tags: guiaMongo.tagsGuia,
                        nivel: guiaMongo.nivelDificultad,
                        duracion: guiaMongo.duracionEstimada,
                        requisitos: guiaMongo.requisitosGuia,
                        estadisticas: guiaMongo.estadisticasGuia
                    } : null
                };
            })
        );

        return res.json(guiasCompletas);
    } catch (error) {
        console.error('Error al mostrar guías de voz:', error);
        return res.status(500).json({ message: 'Error al obtener las guías', error: error.message });
    }
};

// Crear nueva guía de voz
guiaVozCtl.crearGuia = async (req, res) => {
    try {
        const { 
            nombreGuiaVoz, duracionGuiaVoz, mensajeId, idiomaId, lugarTuristicoId, usuarioId,
            audio, transcripcion, categoria, foto, descripcion, tags, nivel, 
            duracionEstimada, requisitos
        } = req.body;

        // Validación de campos requeridos
        if (!nombreGuiaVoz || !duracionGuiaVoz) {
            return res.status(400).json({ message: 'Nombre y duración son obligatorios' });
        }

        // Crear en SQL
        const nuevaGuia = await orm.guiaVoz.create({
            nombreGuiaVoz: cifrarDatos(nombreGuiaVoz),
            duracionGuiaVoz,
            estadoGuiaVoz: 'activo',
            mensajeIdMensaje: mensajeId,
            idiomaIdIdioma: idiomaId,
            lugarTuristicoIdLugarTuristico: lugarTuristicoId,
            usuarioIdUsuario: usuarioId,
            createGuiaVoz: new Date().toLocaleString(),
        });

        // Crear en MongoDB con datos adicionales
        if (audio || transcripcion || categoria || foto || descripcion || tags || nivel || duracionEstimada || requisitos) {
            await mongo.guiaVozModel.create({
                audioGuia: audio || {},
                transcripcionGuia: transcripcion || '',
                idiomaGuia: idiomaId || 'es',
                categoriaGuia: categoria || 'general',
                fotoGuia: foto || '',
                descripcionGuia: descripcion || '',
                tagsGuia: tags || [],
                nivelDificultad: nivel || 'basico',
                duracionEstimada: duracionEstimada || duracionGuiaVoz,
                requisitosGuia: requisitos || [],
                estadisticasGuia: {
                    reproducciones: 0,
                    descargas: 0,
                    calificacionPromedio: 0,
                    totalCalificaciones: 0
                },
                idMensajeSql: mensajeId,
                idGuiaVozSql: nuevaGuia.idGuiaVoz
            });
        }

        return res.status(201).json({ 
            message: 'Guía de voz creada exitosamente',
            idGuiaVoz: nuevaGuia.idGuiaVoz
        });

    } catch (error) {
        console.error('Error al crear guía de voz:', error);
        return res.status(500).json({ 
            message: 'Error al crear la guía', 
            error: error.message 
        });
    }
};

// Actualizar guía de voz
guiaVozCtl.actualizarGuia = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            nombreGuiaVoz, duracionGuiaVoz,
            audio, transcripcion, categoria, foto, descripcion, tags, nivel, 
            duracionEstimada, requisitos
        } = req.body;

        // Validar campos
        if (!nombreGuiaVoz || !duracionGuiaVoz) {
            return res.status(400).json({ message: 'Nombre y duración son obligatorios' });
        }

        // Actualizar en SQL
        await sql.promise().query(
            `UPDATE guiasVoz SET 
                nombreGuiaVoz = ?, 
                duracionGuiaVoz = ?, 
                updateGuiaVoz = ? 
             WHERE idGuiaVoz = ?`,
            [
                cifrarDatos(nombreGuiaVoz),
                duracionGuiaVoz,
                new Date().toLocaleString(),
                id
            ]
        );

        // Actualizar en MongoDB
        if (audio || transcripcion || categoria || foto || descripcion || tags || nivel || duracionEstimada || requisitos) {
            await mongo.guiaVozModel.updateOne(
                { idGuiaVozSql: id },
                {
                    $set: {
                        audioGuia: audio || {},
                        transcripcionGuia: transcripcion || '',
                        categoriaGuia: categoria || 'general',
                        fotoGuia: foto || '',
                        descripcionGuia: descripcion || '',
                        tagsGuia: tags || [],
                        nivelDificultad: nivel || 'basico',
                        duracionEstimada: duracionEstimada || duracionGuiaVoz,
                        requisitosGuia: requisitos || []
                    }
                }
            );
        }

        return res.json({ message: 'Guía de voz actualizada exitosamente' });

    } catch (error) {
        console.error('Error al actualizar guía:', error);
        return res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
};

// Eliminar (desactivar) guía de voz
guiaVozCtl.eliminarGuia = async (req, res) => {
    try {
        const { id } = req.params;

        await sql.promise().query(
            `UPDATE guiasVoz SET 
                estadoGuiaVoz = 'inactivo', 
                updateGuiaVoz = ? 
             WHERE idGuiaVoz = ?`,
            [new Date().toLocaleString(), id]
        );

        return res.json({ message: 'Guía de voz desactivada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar guía:', error);
        return res.status(500).json({ message: 'Error al desactivar', error: error.message });
    }
};

// Obtener guía de voz por ID
guiaVozCtl.obtenerGuia = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [guia] = await sql.promise().query(`
            SELECT gv.*, m.nombreMensaje, i.nombreIdioma, lt.nombreLugar, u.nombreUsuario
            FROM guiasVoz gv
            LEFT JOIN mensajes m ON gv.mensajeIdMensaje = m.idMensaje
            LEFT JOIN idiomas i ON gv.idiomaIdIdioma = i.idIdioma
            LEFT JOIN lugaresTuristicos lt ON gv.lugarTuristicoIdLugarTuristico = lt.idLugarTuristico
            LEFT JOIN usuarios u ON gv.usuarioIdUsuario = u.idUsuario
            WHERE gv.idGuiaVoz = ? AND gv.estadoGuiaVoz = "activo"
        `, [id]);

        if (guia.length === 0) {
            return res.status(404).json({ message: 'Guía de voz no encontrada' });
        }

        const guiaMongo = await mongo.guiaVozModel.findOne({ 
            idGuiaVozSql: id 
        });

        const guiaCompleta = {
            ...guia[0],
            nombreGuiaVoz: descifrarSeguro(guia[0].nombreGuiaVoz),
            nombreMensaje: descifrarSeguro(guia[0].nombreMensaje),
            nombreLugar: descifrarSeguro(guia[0].nombreLugar),
            nombreUsuario: descifrarSeguro(guia[0].nombreUsuario),
            detallesMongo: guiaMongo || null
        };

        return res.json(guiaCompleta);
    } catch (error) {
        console.error('Error al obtener guía:', error);
        return res.status(500).json({ message: 'Error al obtener guía', error: error.message });
    }
};

// Obtener guías por lugar turístico
guiaVozCtl.obtenerPorLugar = async (req, res) => {
    try {
        const { lugarId } = req.params;

        const [guiasPorLugar] = await sql.promise().query(`
            SELECT gv.*, i.nombreIdioma, u.nombreUsuario
            FROM guiasVoz gv
            LEFT JOIN idiomas i ON gv.idiomaIdIdioma = i.idIdioma
            LEFT JOIN usuarios u ON gv.usuarioIdUsuario = u.idUsuario
            WHERE gv.lugarTuristicoIdLugarTuristico = ? AND gv.estadoGuiaVoz = "activo"
            ORDER BY gv.createGuiaVoz DESC
        `, [lugarId]);

        const guiasCompletas = await Promise.all(
            guiasPorLugar.map(async (guia) => {
                const guiaMongo = await mongo.guiaVozModel.findOne({ 
                    idGuiaVozSql: guia.idGuiaVoz 
                });

                return {
                    ...guia,
                    nombreGuiaVoz: descifrarSeguro(guia.nombreGuiaVoz),
                    nombreUsuario: descifrarSeguro(guia.nombreUsuario),
                    detallesMongo: guiaMongo ? {
                        audio: guiaMongo.audioGuia,
                        descripcion: guiaMongo.descripcionGuia,
                        nivel: guiaMongo.nivelDificultad,
                        duracion: guiaMongo.duracionEstimada,
                        estadisticas: guiaMongo.estadisticasGuia
                    } : null
                };
            })
        );

        return res.json(guiasCompletas);
    } catch (error) {
        console.error('Error al obtener guías por lugar:', error);
        return res.status(500).json({ message: 'Error en la búsqueda', error: error.message });
    }
};

// Obtener guías por idioma
guiaVozCtl.obtenerPorIdioma = async (req, res) => {
    try {
        const { idiomaId } = req.params;

        const [guiasPorIdioma] = await sql.promise().query(`
            SELECT gv.*, lt.nombreLugar, u.nombreUsuario
            FROM guiasVoz gv
            LEFT JOIN lugaresTuristicos lt ON gv.lugarTuristicoIdLugarTuristico = lt.idLugarTuristico
            LEFT JOIN usuarios u ON gv.usuarioIdUsuario = u.idUsuario
            WHERE gv.idiomaIdIdioma = ? AND gv.estadoGuiaVoz = "activo"
            ORDER BY gv.createGuiaVoz DESC
        `, [idiomaId]);

        const guiasCompletas = await Promise.all(
            guiasPorIdioma.map(async (guia) => {
                const guiaMongo = await mongo.guiaVozModel.findOne({ 
                    idGuiaVozSql: guia.idGuiaVoz 
                });

                return {
                    ...guia,
                    nombreGuiaVoz: descifrarSeguro(guia.nombreGuiaVoz),
                    nombreLugar: descifrarSeguro(guia.nombreLugar),
                    nombreUsuario: descifrarSeguro(guia.nombreUsuario),
                    detallesMongo: guiaMongo || null
                };
            })
        );

        return res.json(guiasCompletas);
    } catch (error) {
        console.error('Error al obtener guías por idioma:', error);
        return res.status(500).json({ message: 'Error en la búsqueda', error: error.message });
    }
};

// Registrar reproducción de guía
guiaVozCtl.registrarReproduccion = async (req, res) => {
    try {
        const { id } = req.params;

        // Actualizar estadísticas en MongoDB
        await mongo.guiaVozModel.updateOne(
            { idGuiaVozSql: id },
            { $inc: { 'estadisticasGuia.reproducciones': 1 } }
        );

        return res.json({ message: 'Reproducción registrada' });
    } catch (error) {
        console.error('Error al registrar reproducción:', error);
        return res.status(500).json({ message: 'Error al actualizar estadísticas', error: error.message });
    }
};

// Registrar descarga de guía
guiaVozCtl.registrarDescarga = async (req, res) => {
    try {
        const { id } = req.params;

        // Actualizar estadísticas en MongoDB
        await mongo.guiaVozModel.updateOne(
            { idGuiaVozSql: id },
            { $inc: { 'estadisticasGuia.descargas': 1 } }
        );

        return res.json({ message: 'Descarga registrada' });
    } catch (error) {
        console.error('Error al registrar descarga:', error);
        return res.status(500).json({ message: 'Error al actualizar estadísticas', error: error.message });
    }
};

// Buscar guías por categoría
guiaVozCtl.buscarPorCategoria = async (req, res) => {
    try {
        const { categoria } = req.params;

        // Buscar en MongoDB por categoría
        const guiasPorCategoria = await mongo.guiaVozModel.find({
            categoriaGuia: categoria
        });

        // Obtener datos de SQL para cada guía encontrada
        const guiasCompletas = await Promise.all(
            guiasPorCategoria.map(async (guiaMongo) => {
                const [guiaSql] = await sql.promise().query(
                    'SELECT * FROM guiasVoz WHERE idGuiaVoz = ? AND estadoGuiaVoz = "activo"',
                    [guiaMongo.idGuiaVozSql]
                );

                if (guiaSql.length > 0) {
                    return {
                        ...guiaSql[0],
                        nombreGuiaVoz: descifrarSeguro(guiaSql[0].nombreGuiaVoz),
                        detallesMongo: guiaMongo
                    };
                }
                return null;
            })
        );

        const guiasFiltradas = guiasCompletas.filter(guia => guia !== null);

        return res.json(guiasFiltradas);
    } catch (error) {
        console.error('Error al buscar guías por categoría:', error);
        return res.status(500).json({ message: 'Error en la búsqueda', error: error.message });
    }
};

module.exports = guiaVozCtl;