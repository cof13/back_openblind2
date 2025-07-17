const estacionCtl = {};
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

// Mostrar todas las estaciones activas
estacionCtl.mostrarEstaciones = async (req, res) => {
    try {
        const [listaEstaciones] = await sql.promise().query(`
            SELECT e.*, ce.nombreCategoriaEstacion 
            FROM estaciones e
            LEFT JOIN categoriasEstacions ce ON e.categoriaEstacionIdCategoriaEstacion = ce.idCategoriaEstacion
            WHERE e.estadoEstacion = "activo"
        `);
        
        const estacionesCompletas = await Promise.all(
            listaEstaciones.map(async (estacion) => {
                // Obtener datos adicionales de MongoDB
                const estacionMongo = await mongo.estacionModel.findOne({ 
                    idEstacionSql: estacion.idEstacion 
                });

                // Obtener métodos de ingreso
                const [metodosIngresos] = await sql.promise().query(`
                    SELECT mi.nombreMetodo, mi.descripcionMetodo 
                    FROM estacionMetodos em
                    JOIN metodosIngresos mi ON em.metodoIngresoIdMetodoIngreso = mi.idMetodoIngreso
                    WHERE em.estacionIdEstacion = ?
                `, [estacion.idEstacion]);

                return {
                    ...estacion,
                    nombreEstacion: descifrarSeguro(estacion.nombreEstacion),
                    codigoEstacion: descifrarSeguro(estacion.codigoEstacion),
                    metodosIngresos: metodosIngresos,
                    detallesMongo: estacionMongo ? {
                        ubicacion: estacionMongo.ubicacionEstacion,
                        horarios: estacionMongo.horariosDetallados,
                        servicios: estacionMongo.serviciosEstacion,
                        accesibilidad: estacionMongo.accesibilidadEstacion,
                        fotos: estacionMongo.fotosEstacion,
                        contacto: estacionMongo.contactoEstacion
                    } : null
                };
            })
        );

        return res.json(estacionesCompletas);
    } catch (error) {
        console.error('Error al mostrar estaciones:', error);
        return res.status(500).json({ message: 'Error al obtener las estaciones', error: error.message });
    }
};

// Crear nueva estación
estacionCtl.crearEstacion = async (req, res) => {
    try {
        const { 
            nombreEstacion, codigoEstacion, numeroEntradas, categoriaEstacionId,
            ubicacion, horarios, servicios, accesibilidad, fotos, contacto, metodosIngresos
        } = req.body;

        // Validación de campos requeridos
        if (!nombreEstacion || !numeroEntradas) {
            return res.status(400).json({ message: 'Nombre y número de entradas son obligatorios' });
        }

        // Crear en SQL con datos encriptados
        const nuevaEstacion = await orm.estacion.create({
            nombreEstacion: cifrarDatos(nombreEstacion),
            codigoEstacion: cifrarDatos(codigoEstacion || ''),
            numeroEntradas,
            estadoEstacion: 'activo',
            categoriaEstacionIdCategoriaEstacion: categoriaEstacionId,
            createEstacion: new Date().toLocaleString(),
        });

        // Crear relaciones con métodos de ingreso
        if (metodosIngresos && metodosIngresos.length > 0) {
            for (const metodoId of metodosIngresos) {
                await orm.estacionMetodo.create({
                    estacionIdEstacion: nuevaEstacion.idEstacion,
                    metodoIngresoIdMetodoIngreso: metodoId,
                    createEstacionMetodo: new Date().toLocaleString()
                });
            }
        }

        // Crear en MongoDB con datos adicionales
        if (ubicacion || horarios || servicios || accesibilidad || fotos || contacto) {
            await mongo.estacionModel.create({
                ubicacionEstacion: ubicacion || {},
                horariosDetallados: horarios || [],
                serviciosEstacion: servicios || {},
                accesibilidadEstacion: accesibilidad || {},
                fotosEstacion: fotos || [],
                contactoEstacion: contacto || {},
                idEstacionSql: nuevaEstacion.idEstacion
            });
        }

        return res.status(201).json({ 
            message: 'Estación creada exitosamente',
            idEstacion: nuevaEstacion.idEstacion
        });

    } catch (error) {
        console.error('Error al crear estación:', error);
        return res.status(500).json({ 
            message: 'Error al crear la estación', 
            error: error.message 
        });
    }
};

// Actualizar estación
estacionCtl.actualizarEstacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            nombreEstacion, codigoEstacion, numeroEntradas,
            ubicacion, horarios, servicios, accesibilidad, fotos, contacto, metodosIngresos
        } = req.body;

        // Validar campos
        if (!nombreEstacion || !numeroEntradas) {
            return res.status(400).json({ message: 'Datos básicos son obligatorios' });
        }

        // Actualizar en SQL
        await sql.promise().query(
            `UPDATE estaciones SET 
                nombreEstacion = ?, 
                codigoEstacion = ?, 
                numeroEntradas = ?, 
                updateEstacion = ? 
             WHERE idEstacion = ?`,
            [
                cifrarDatos(nombreEstacion),
                cifrarDatos(codigoEstacion || ''),
                numeroEntradas,
                new Date().toLocaleString(),
                id
            ]
        );

        // Actualizar métodos de ingreso
        if (metodosIngresos) {
            // Eliminar relaciones existentes
            await sql.promise().query(
                'DELETE FROM estacionMetodos WHERE estacionIdEstacion = ?',
                [id]
            );
            
            // Crear nuevas relaciones
            for (const metodoId of metodosIngresos) {
                await orm.estacionMetodo.create({
                    estacionIdEstacion: id,
                    metodoIngresoIdMetodoIngreso: metodoId,
                    createEstacionMetodo: new Date().toLocaleString()
                });
            }
        }

        // Actualizar en MongoDB
        if (ubicacion || horarios || servicios || accesibilidad || fotos || contacto) {
            await mongo.estacionModel.updateOne(
                { idEstacionSql: id },
                {
                    $set: {
                        ubicacionEstacion: ubicacion || {},
                        horariosDetallados: horarios || [],
                        serviciosEstacion: servicios || {},
                        accesibilidadEstacion: accesibilidad || {},
                        fotosEstacion: fotos || [],
                        contactoEstacion: contacto || {}
                    }
                }
            );
        }

        return res.json({ message: 'Estación actualizada exitosamente' });

    } catch (error) {
        console.error('Error al actualizar estación:', error);
        return res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
};

// Eliminar (desactivar) estación
estacionCtl.eliminarEstacion = async (req, res) => {
    try {
        const { id } = req.params;

        await sql.promise().query(
            `UPDATE estaciones SET 
                estadoEstacion = 'inactivo', 
                updateEstacion = ? 
             WHERE idEstacion = ?`,
            [new Date().toLocaleString(), id]
        );

        return res.json({ message: 'Estación desactivada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar estación:', error);
        return res.status(500).json({ message: 'Error al desactivar', error: error.message });
    }
};

// Obtener estación por ID
estacionCtl.obtenerEstacion = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [estacion] = await sql.promise().query(
            'SELECT * FROM estaciones WHERE idEstacion = ? AND estadoEstacion = "activo"',
            [id]
        );

        if (estacion.length === 0) {
            return res.status(404).json({ message: 'Estación no encontrada' });
        }

        const estacionMongo = await mongo.estacionModel.findOne({ 
            idEstacionSql: id 
        });

        // Obtener métodos de ingreso
        const [metodosIngresos] = await sql.promise().query(`
            SELECT mi.* 
            FROM estacionMetodos em
            JOIN metodosIngresos mi ON em.metodoIngresoIdMetodoIngreso = mi.idMetodoIngreso
            WHERE em.estacionIdEstacion = ?
        `, [id]);

        const estacionCompleta = {
            ...estacion[0],
            nombreEstacion: descifrarSeguro(estacion[0].nombreEstacion),
            codigoEstacion: descifrarSeguro(estacion[0].codigoEstacion),
            metodosIngresos: metodosIngresos,
            detallesMongo: estacionMongo || null
        };

        return res.json(estacionCompleta);
    } catch (error) {
        console.error('Error al obtener estación:', error);
        return res.status(500).json({ message: 'Error al obtener estación', error: error.message });
    }
};

// Buscar estaciones por ubicación (usando MongoDB)
estacionCtl.buscarPorUbicacion = async (req, res) => {
    try {
        const { latitud, longitud, radio = 5000 } = req.query; // radio en metros

        if (!latitud || !longitud) {
            return res.status(400).json({ message: 'Latitud y longitud son requeridas' });
        }

        // Buscar en MongoDB usando coordenadas
        const estacionesCercanas = await mongo.estacionModel.find({
            'ubicacionEstacion.latitud': {
                $gte: parseFloat(latitud) - (radio / 111000), // conversión aproximada de metros a grados
                $lte: parseFloat(latitud) + (radio / 111000)
            },
            'ubicacionEstacion.longitud': {
                $gte: parseFloat(longitud) - (radio / 111000),
                $lte: parseFloat(longitud) + (radio / 111000)
            }
        });

        // Obtener datos de SQL para cada estación encontrada
        const estacionesCompletas = await Promise.all(
            estacionesCercanas.map(async (estacionMongo) => {
                const [estacionSql] = await sql.promise().query(
                    'SELECT * FROM estaciones WHERE idEstacion = ? AND estadoEstacion = "activo"',
                    [estacionMongo.idEstacionSql]
                );

                if (estacionSql.length > 0) {
                    return {
                        ...estacionSql[0],
                        nombreEstacion: descifrarSeguro(estacionSql[0].nombreEstacion),
                        detallesMongo: estacionMongo
                    };
                }
                return null;
            })
        );

        const estacionesFiltradas = estacionesCompletas.filter(estacion => estacion !== null);

        return res.json(estacionesFiltradas);
    } catch (error) {
        console.error('Error al buscar estaciones por ubicación:', error);
        return res.status(500).json({ message: 'Error en la búsqueda', error: error.message });
    }
};

module.exports = estacionCtl;