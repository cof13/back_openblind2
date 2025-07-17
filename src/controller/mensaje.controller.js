const mensajeCtl = {};
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

// Mostrar todos los mensajes activos
mensajeCtl.mostrarMensajes = async (req, res) => {
    try {
        const [listaMensajes] = await sql.promise().query(`
            SELECT m.*, tm.nombreTipoMensaje, u.nombreUsuario
            FROM mensajes m
            LEFT JOIN tiposMensajes tm ON m.tipoMensajeIdTipoMensaje = tm.idTipoMensaje
            LEFT JOIN usuarios u ON m.usuarioIdUsuario = u.idUsuario
            WHERE m.estadoMensaje = "activo"
            ORDER BY m.prioridadMensaje DESC, m.createMensaje DESC
        `);
        
        const mensajesCompletos = await Promise.all(
            listaMensajes.map(async (mensaje) => {
                // Obtener datos adicionales de MongoDB
                const mensajeMongo = await mongo.mensajeModel.findOne({ 
                    idMensajeSql: mensaje.idMensaje 
                });

                return {
                    ...mensaje,
                    nombreMensaje: descifrarSeguro(mensaje.nombreMensaje),
                    nombreUsuario: descifrarSeguro(mensaje.nombreUsuario),
                    detallesMongo: mensajeMongo ? {
                        descripcion: mensajeMongo.descripcionMensaje,
                        contenido: mensajeMongo.contenidoMensaje,
                        fechaPublicacion: mensajeMongo.fechaPublicacion,
                        fechaExpiracion: mensajeMongo.fechaExpiracion,
                        audiencia: mensajeMongo.audienciaObjetivo,
                        multimedia: mensajeMongo.multimedia,
                        configuracion: mensajeMongo.configuracionMensaje,
                        estadisticas: mensajeMongo.estadisticasMensaje
                    } : null
                };
            })
        );

        return res.json(mensajesCompletos);
    } catch (error) {
        console.error('Error al mostrar mensajes:', error);
        return res.status(500).json({ message: 'Error al obtener los mensajes', error: error.message });
    }
};

// Crear nuevo mensaje
mensajeCtl.crearMensaje = async (req, res) => {
    try {
        const { 
            nombreMensaje, prioridadMensaje, tipoMensajeId, usuarioId,
            descripcion, contenido, fechaPublicacion, fechaExpiracion,
            audiencia, multimedia, configuracion
        } = req.body;

        // Validación de campos requeridos
        if (!nombreMensaje || !tipoMensajeId || !usuarioId) {
            return res.status(400).json({ message: 'Nombre, tipo de mensaje y usuario son obligatorios' });
        }

        // Crear en SQL
        const nuevoMensaje = await orm.mensaje.create({
            nombreMensaje: cifrarDatos(nombreMensaje),
            estadoMensaje: 'activo',
            prioridadMensaje: prioridadMensaje || 1,
            tipoMensajeIdTipoMensaje: tipoMensajeId,
            usuarioIdUsuario: usuarioId,
            createMensaje: new Date().toLocaleString(),
        });

        // Crear en MongoDB con datos adicionales
        if (descripcion || contenido || fechaPublicacion || fechaExpiracion || audiencia || multimedia || configuracion) {
            await mongo.mensajeModel.create({
                descripcionMensaje: descripcion || '',
                contenidoMensaje: contenido || '',
                fechaPublicacion: fechaPublicacion || new Date(),
                fechaExpiracion: fechaExpiracion || null,
                audienciaObjetivo: audiencia || { usuarios: [], roles: [], ubicaciones: [] },
                multimedia: multimedia || { imagenes: [], videos: [], documentos: [] },
                configuracionMensaje: configuracion || {
                    urgente: false,
                    notificacionPush: true,
                    notificacionEmail: false,
                    mostrarEnPantalla: true
                },
                estadisticasMensaje: { visto: 0, leido: 0, compartido: 0 },
                idMensajeSql: nuevoMensaje.idMensaje
            });
        }

        return res.status(201).json({ 
            message: 'Mensaje creado exitosamente',
            idMensaje: nuevoMensaje.idMensaje
        });

    } catch (error) {
        console.error('Error al crear mensaje:', error);
        return res.status(500).json({ 
            message: 'Error al crear el mensaje', 
            error: error.message 
        });
    }
};

// Actualizar mensaje
mensajeCtl.actualizarMensaje = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            nombreMensaje, prioridadMensaje,
            descripcion, contenido, fechaPublicacion, fechaExpiracion,
            audiencia, multimedia, configuracion
        } = req.body;

        // Validar campos
        if (!nombreMensaje) {
            return res.status(400).json({ message: 'Nombre del mensaje es obligatorio' });
        }

        // Actualizar en SQL
        await sql.promise().query(
            `UPDATE mensajes SET 
                nombreMensaje = ?, 
                prioridadMensaje = ?, 
                updateMensaje = ? 
             WHERE idMensaje = ?`,
            [
                cifrarDatos(nombreMensaje),
                prioridadMensaje || 1,
                new Date().toLocaleString(),
                id
            ]
        );

        // Actualizar en MongoDB
        if (descripcion || contenido || fechaPublicacion || fechaExpiracion || audiencia || multimedia || configuracion) {
            await mongo.mensajeModel.updateOne(
                { idMensajeSql: id },
                {
                    $set: {
                        descripcionMensaje: descripcion || '',
                        contenidoMensaje: contenido || '',
                        fechaPublicacion: fechaPublicacion || new Date(),
                        fechaExpiracion: fechaExpiracion || null,
                        audienciaObjetivo: audiencia || {},
                        multimedia: multimedia || {},
                        configuracionMensaje: configuracion || {}
                    }
                }
            );
        }

        return res.json({ message: 'Mensaje actualizado exitosamente' });

    } catch (error) {
        console.error('Error al actualizar mensaje:', error);
        return res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
};

// Eliminar (desactivar) mensaje
mensajeCtl.eliminarMensaje = async (req, res) => {
    try {
        const { id } = req.params;

        await sql.promise().query(
            `UPDATE mensajes SET 
                estadoMensaje = 'inactivo', 
                updateMensaje = ? 
             WHERE idMensaje = ?`,
            [new Date().toLocaleString(), id]
        );

        return res.json({ message: 'Mensaje desactivado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar mensaje:', error);
        return res.status(500).json({ message: 'Error al desactivar', error: error.message });
    }
};

// Obtener mensaje por ID
mensajeCtl.obtenerMensaje = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [mensaje] = await sql.promise().query(`
            SELECT m.*, tm.nombreTipoMensaje, u.nombreUsuario
            FROM mensajes m
            LEFT JOIN tiposMensajes tm ON m.tipoMensajeIdTipoMensaje = tm.idTipoMensaje
            LEFT JOIN usuarios u ON m.usuarioIdUsuario = u.idUsuario
            WHERE m.idMensaje = ? AND m.estadoMensaje = "activo"
        `, [id]);

        if (mensaje.length === 0) {
            return res.status(404).json({ message: 'Mensaje no encontrado' });
        }

        const mensajeMongo = await mongo.mensajeModel.findOne({ 
            idMensajeSql: id 
        });

        const mensajeCompleto = {
            ...mensaje[0],
            nombreMensaje: descifrarSeguro(mensaje[0].nombreMensaje),
            nombreUsuario: descifrarSeguro(mensaje[0].nombreUsuario),
            detallesMongo: mensajeMongo || null
        };

        return res.json(mensajeCompleto);
    } catch (error) {
        console.error('Error al obtener mensaje:', error);
        return res.status(500).json({ message: 'Error al obtener mensaje', error: error.message });
    }
};

// Obtener mensajes por tipo
mensajeCtl.obtenerPorTipo = async (req, res) => {
    try {
        const { tipoId } = req.params;

        const [mensajesPorTipo] = await sql.promise().query(`
            SELECT m.*, tm.nombreTipoMensaje, u.nombreUsuario
            FROM mensajes m
            JOIN tiposMensajes tm ON m.tipoMensajeIdTipoMensaje = tm.idTipoMensaje
            LEFT JOIN usuarios u ON m.usuarioIdUsuario = u.idUsuario
            WHERE m.tipoMensajeIdTipoMensaje = ? AND m.estadoMensaje = "activo"
            ORDER BY m.prioridadMensaje DESC, m.createMensaje DESC
        `, [tipoId]);

        const mensajesCompletos = await Promise.all(
            mensajesPorTipo.map(async (mensaje) => {
                const mensajeMongo = await mongo.mensajeModel.findOne({ 
                    idMensajeSql: mensaje.idMensaje 
                });

                return {
                    ...mensaje,
                    nombreMensaje: descifrarSeguro(mensaje.nombreMensaje),
                    nombreUsuario: descifrarSeguro(mensaje.nombreUsuario),
                    detallesMongo: mensajeMongo ? {
                        descripcion: mensajeMongo.descripcionMensaje,
                        contenido: mensajeMongo.contenidoMensaje,
                        configuracion: mensajeMongo.configuracionMensaje
                    } : null
                };
            })
        );

        return res.json(mensajesCompletos);
    } catch (error) {
        console.error('Error al obtener mensajes por tipo:', error);
        return res.status(500).json({ message: 'Error en la búsqueda', error: error.message });
    }
};

// Marcar mensaje como visto
mensajeCtl.marcarComoVisto = async (req, res) => {
    try {
        const { id } = req.params;

        // Actualizar estadísticas en MongoDB
        await mongo.mensajeModel.updateOne(
            { idMensajeSql: id },
            { $inc: { 'estadisticasMensaje.visto': 1 } }
        );

        return res.json({ message: 'Mensaje marcado como visto' });
    } catch (error) {
        console.error('Error al marcar mensaje como visto:', error);
        return res.status(500).json({ message: 'Error al actualizar estadísticas', error: error.message });
    }
};

// Marcar mensaje como leído
mensajeCtl.marcarComoLeido = async (req, res) => {
    try {
        const { id } = req.params;

        // Actualizar estadísticas en MongoDB
        await mongo.mensajeModel.updateOne(
            { idMensajeSql: id },
            { $inc: { 'estadisticasMensaje.leido': 1 } }
        );

        return res.json({ message: 'Mensaje marcado como leído' });
    } catch (error) {
        console.error('Error al marcar mensaje como leído:', error);
        return res.status(500).json({ message: 'Error al actualizar estadísticas', error: error.message });
    }
};

// Obtener mensajes urgentes
mensajeCtl.obtenerMensajesUrgentes = async (req, res) => {
    try {
        // Buscar mensajes urgentes en MongoDB
        const mensajesUrgentes = await mongo.mensajeModel.find({
            'configuracionMensaje.urgente': true,
            fechaExpiracion: { $gte: new Date() }
        });

        // Obtener datos de SQL para cada mensaje urgente
        const mensajesCompletos = await Promise.all(
            mensajesUrgentes.map(async (mensajeMongo) => {
                const [mensajeSql] = await sql.promise().query(
                    'SELECT * FROM mensajes WHERE idMensaje = ? AND estadoMensaje = "activo"',
                    [mensajeMongo.idMensajeSql]
                );

                if (mensajeSql.length > 0) {
                    return {
                        ...mensajeSql[0],
                        nombreMensaje: descifrarSeguro(mensajeSql[0].nombreMensaje),
                        detallesMongo: mensajeMongo
                    };
                }
                return null;
            })
        );

        const mensajesFiltrados = mensajesCompletos.filter(mensaje => mensaje !== null);

        return res.json(mensajesFiltrados);
    } catch (error) {
        console.error('Error al obtener mensajes urgentes:', error);
        return res.status(500).json({ message: 'Error en la búsqueda', error: error.message });
    }
};

module.exports = mensajeCtl;