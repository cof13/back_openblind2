const lugarTuristicoCtl = {};
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

// Mostrar todos los lugares turísticos activos
lugarTuristicoCtl.mostrarLugares = async (req, res) => {
    try {
        const [listaLugares] = await sql.promise().query(`
            SELECT lt.*, cl.nombreCategoriaLugar, e.nombreEstacion
            FROM lugaresTuristicos lt
            LEFT JOIN categoriasLugars cl ON lt.categoriaLugarIdCategoriaLugar = cl.idCategoriaLugar
            LEFT JOIN estaciones e ON lt.estacionIdEstacion = e.idEstacion
            WHERE lt.estadoLugar = "activo"
        `);
        
        const lugaresCompletos = await Promise.all(
            listaLugares.map(async (lugar) => {
                // Obtener datos adicionales de MongoDB
                const lugarMongo = await mongo.lugarTuristicoModel.findOne({ 
                    idLugarSql: lugar.idLugarTuristico 
                });

                // Obtener calificaciones promedio
                const [calificacionPromedio] = await sql.promise().query(`
                    SELECT AVG(puntajeCalificacion) as promedio, COUNT(*) as total
                    FROM calificaciones 
                    WHERE lugarTuristicoIdLugarTuristico = ? AND estadoCalificacion = "activo"
                `, [lugar.idLugarTuristico]);

                return {
                    ...lugar,
                    nombreLugar: descifrarSeguro(lugar.nombreLugar),
                    codigoLugar: descifrarSeguro(lugar.codigoLugar),
                    nombreEstacion: descifrarSeguro(lugar.nombreEstacion),
                    calificacion: {
                        promedio: calificacionPromedio[0].promedio || 0,
                        totalCalificaciones: calificacionPromedio[0].total || 0
                    },
                    detallesMongo: lugarMongo ? {
                        descripcion: lugarMongo.descripcionLugar,
                        ubicacion: lugarMongo.ubicacionLugar,
                        referencias: lugarMongo.referenciasLugar,
                        imagenes: lugarMongo.imagenesLugar,
                        videos: lugarMongo.videosLugar,
                        horarios: lugarMongo.horariosLugar,
                        tarifas: lugarMongo.tarifasLugar,
                        servicios: lugarMongo.serviciosLugar,
                        contacto: lugarMongo.contactoLugar
                    } : null
                };
            })
        );

        return res.json(lugaresCompletos);
    } catch (error) {
        console.error('Error al mostrar lugares turísticos:', error);
        return res.status(500).json({ message: 'Error al obtener los lugares', error: error.message });
    }
};

// Crear nuevo lugar turístico
lugarTuristicoCtl.crearLugar = async (req, res) => {
    try {
        const { 
            nombreLugar, codigoLugar, categoriaLugarId, estacionId, usuarioRegistraId,
            descripcion, ubicacion, referencias, imagenes, videos, horarios, 
            tarifas, servicios, contacto
        } = req.body;

        // Validación de campos requeridos
        if (!nombreLugar) {
            return res.status(400).json({ message: 'Nombre del lugar es obligatorio' });
        }

        // Crear en SQL
        const nuevoLugar = await orm.lugarTuristico.create({
            nombreLugar: cifrarDatos(nombreLugar),
            codigoLugar: cifrarDatos(codigoLugar || ''),
            estadoLugar: 'activo',
            categoriaLugarIdCategoriaLugar: categoriaLugarId,
            estacionIdEstacion: estacionId,
            usuarioIdUsuario: usuarioRegistraId,
            createLugar: new Date().toLocaleString(),
        });

        // Crear en MongoDB con datos adicionales
        if (descripcion || ubicacion || referencias || imagenes || videos || horarios || tarifas || servicios || contacto) {
            await mongo.lugarTuristicoModel.create({
                descripcionLugar: descripcion || '',
                ubicacionLugar: ubicacion || {},
                referenciasLugar: referencias || [],
                imagenesLugar: imagenes || [],
                videosLugar: videos || [],
                horariosLugar: horarios || [],
                tarifasLugar: tarifas || {},
                serviciosLugar: servicios || {},
                contactoLugar: contacto || {},
                reseñasLugar: [],
                idLugarSql: nuevoLugar.idLugarTuristico
            });
        }

        return res.status(201).json({ 
            message: 'Lugar turístico creado exitosamente',
            idLugar: nuevoLugar.idLugarTuristico
        });

    } catch (error) {
        console.error('Error al crear lugar turístico:', error);
        return res.status(500).json({ 
            message: 'Error al crear el lugar', 
            error: error.message 
        });
    }
};

// Actualizar lugar turístico
lugarTuristicoCtl.actualizarLugar = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            nombreLugar, codigoLugar,
            descripcion, ubicacion, referencias, imagenes, videos, horarios, 
            tarifas, servicios, contacto
        } = req.body;

        // Validar campos
        if (!nombreLugar) {
            return res.status(400).json({ message: 'Nombre del lugar es obligatorio' });
        }

        // Actualizar en SQL
        await sql.promise().query(
            `UPDATE lugaresTuristicos SET 
                nombreLugar = ?, 
                codigoLugar = ?, 
                updateLugar = ? 
             WHERE idLugarTuristico = ?`,
            [
                cifrarDatos(nombreLugar),
                cifrarDatos(codigoLugar || ''),
                new Date().toLocaleString(),
                id
            ]
        );

        // Actualizar en MongoDB
        if (descripcion || ubicacion || referencias || imagenes || videos || horarios || tarifas || servicios || contacto) {
            await mongo.lugarTuristicoModel.updateOne(
                { idLugarSql: id },
                {
                    $set: {
                        descripcionLugar: descripcion || '',
                        ubicacionLugar: ubicacion || {},
                        referenciasLugar: referencias || [],
                        imagenesLugar: imagenes || [],
                        videosLugar: videos || [],
                        horariosLugar: horarios || [],
                        tarifasLugar: tarifas || {},
                        serviciosLugar: servicios || {},
                        contactoLugar: contacto || {}
                    }
                }
            );
        }

        return res.json({ message: 'Lugar turístico actualizado exitosamente' });

    } catch (error) {
        console.error('Error al actualizar lugar:', error);
        return res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
};

// Eliminar (desactivar) lugar turístico
lugarTuristicoCtl.eliminarLugar = async (req, res) => {
    try {
        const { id } = req.params;

        await sql.promise().query(
            `UPDATE lugaresTuristicos SET 
                estadoLugar = 'inactivo', 
                updateLugar = ? 
             WHERE idLugarTuristico = ?`,
            [new Date().toLocaleString(), id]
        );

        return res.json({ message: 'Lugar turístico desactivado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar lugar:', error);
        return res.status(500).json({ message: 'Error al desactivar', error: error.message });
    }
};

// Obtener lugar turístico por ID
lugarTuristicoCtl.obtenerLugar = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [lugar] = await sql.promise().query(`
            SELECT lt.*, cl.nombreCategoriaLugar, e.nombreEstacion
            FROM lugaresTuristicos lt
            LEFT JOIN categoriasLugars cl ON lt.categoriaLugarIdCategoriaLugar = cl.idCategoriaLugar
            LEFT JOIN estaciones e ON lt.estacionIdEstacion = e.idEstacion
            WHERE lt.idLugarTuristico = ? AND lt.estadoLugar = "activo"
        `, [id]);

        if (lugar.length === 0) {
            return res.status(404).json({ message: 'Lugar turístico no encontrado' });
        }

        const lugarMongo = await mongo.lugarTuristicoModel.findOne({ 
            idLugarSql: id 
        });

        // Obtener calificaciones
        const [calificaciones] = await sql.promise().query(`
            SELECT c.*, u.nombreUsuario
            FROM calificaciones c
            LEFT JOIN usuarios u ON c.usuarioIdUsuario = u.idUsuario
            WHERE c.lugarTuristicoIdLugarTuristico = ? AND c.estadoCalificacion = "activo"
            ORDER BY c.createCalificacion DESC
        `, [id]);

        const lugarCompleto = {
            ...lugar[0],
            nombreLugar: descifrarSeguro(lugar[0].nombreLugar),
            codigoLugar: descifrarSeguro(lugar[0].codigoLugar),
            nombreEstacion: descifrarSeguro(lugar[0].nombreEstacion),
            calificaciones: calificaciones.map(cal => ({
                ...cal,
                nombreUsuario: descifrarSeguro(cal.nombreUsuario)
            })),
            detallesMongo: lugarMongo || null
        };

        return res.json(lugarCompleto);
    } catch (error) {
        console.error('Error al obtener lugar:', error);
        return res.status(500).json({ message: 'Error al obtener lugar', error: error.message });
    }
};

// Buscar lugares por categoría
lugarTuristicoCtl.buscarPorCategoria = async (req, res) => {
    try {
        const { idCategoria } = req.params;

        const [lugaresPorCategoria] = await sql.promise().query(`
            SELECT lt.*, cl.nombreCategoriaLugar
            FROM lugaresTuristicos lt
            JOIN categoriasLugars cl ON lt.categoriaLugarIdCategoriaLugar = cl.idCategoriaLugar
            WHERE lt.categoriaLugarIdCategoriaLugar = ? AND lt.estadoLugar = "activo"
        `, [idCategoria]);

        const lugaresCompletos = await Promise.all(
            lugaresPorCategoria.map(async (lugar) => {
                const lugarMongo = await mongo.lugarTuristicoModel.findOne({ 
                    idLugarSql: lugar.idLugarTuristico 
                });

                return {
                    ...lugar,
                    nombreLugar: descifrarSeguro(lugar.nombreLugar),
                    detallesMongo: lugarMongo ? {
                        descripcion: lugarMongo.descripcionLugar,
                        ubicacion: lugarMongo.ubicacionLugar,
                        imagenes: lugarMongo.imagenesLugar,
                        tarifas: lugarMongo.tarifasLugar
                    } : null
                };
            })
        );

        return res.json(lugaresCompletos);
    } catch (error) {
        console.error('Error al buscar lugares por categoría:', error);
        return res.status(500).json({ message: 'Error en la búsqueda', error: error.message });
    }
};

// Buscar lugares por ubicación (usando MongoDB)
lugarTuristicoCtl.buscarPorUbicacion = async (req, res) => {
    try {
        const { latitud, longitud, radio = 10000 } = req.query; // radio en metros

        if (!latitud || !longitud) {
            return res.status(400).json({ message: 'Latitud y longitud son requeridas' });
        }

        // Buscar en MongoDB usando coordenadas
        const lugaresCercanos = await mongo.lugarTuristicoModel.find({
            'ubicacionLugar.latitud': {
                $gte: parseFloat(latitud) - (radio / 111000),
                $lte: parseFloat(latitud) + (radio / 111000)
            },
            'ubicacionLugar.longitud': {
                $gte: parseFloat(longitud) - (radio / 111000),
                $lte: parseFloat(longitud) + (radio / 111000)
            }
        });

        // Obtener datos de SQL para cada lugar encontrado
        const lugaresCompletos = await Promise.all(
            lugaresCercanos.map(async (lugarMongo) => {
                const [lugarSql] = await sql.promise().query(
                    'SELECT * FROM lugaresTuristicos WHERE idLugarTuristico = ? AND estadoLugar = "activo"',
                    [lugarMongo.idLugarSql]
                );

                if (lugarSql.length > 0) {
                    return {
                        ...lugarSql[0],
                        nombreLugar: descifrarSeguro(lugarSql[0].nombreLugar),
                        detallesMongo: lugarMongo
                    };
                }
                return null;
            })
        );

        const lugaresFiltrados = lugaresCompletos.filter(lugar => lugar !== null);

        return res.json(lugaresFiltrados);
    } catch (error) {
        console.error('Error al buscar lugares por ubicación:', error);
        return res.status(500).json({ message: 'Error en la búsqueda', error: error.message });
    }
};

// Agregar reseña a un lugar
lugarTuristicoCtl.agregarResena = async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario, calificacion, comentario } = req.body;

        if (!usuario || !calificacion || calificacion < 1 || calificacion > 5) {
            return res.status(400).json({ message: 'Usuario y calificación (1-5) son requeridos' });
        }

        // Agregar reseña en MongoDB
        const nuevaResena = {
            usuario,
            calificacion,
            comentario: comentario || '',
            fecha: new Date()
        };

        await mongo.lugarTuristicoModel.updateOne(
            { idLugarSql: id },
            { $push: { reseñasLugar: nuevaResena } }
        );

        return res.status(201).json({ message: 'Reseña agregada exitosamente' });

    } catch (error) {
        console.error('Error al agregar reseña:', error);
        return res.status(500).json({ message: 'Error al agregar reseña', error: error.message });
    }
};

module.exports = lugarTuristicoCtl;