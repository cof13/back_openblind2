const transporteCtl = {};
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

// Mostrar todos los transportes activos
transporteCtl.mostrarTransportes = async (req, res) => {
    try {
        const [listaTransportes] = await sql.promise().query(`
            SELECT t.*, ct.nombreCategoria, et.nombreEmpresa, c.nombreConductor 
            FROM transportes t
            LEFT JOIN categoriasTransportes ct ON t.categoriaTransporteIdCategoriaTransporte = ct.idCategoriaTransporte
            LEFT JOIN empresasTransporte et ON t.empresaTransporteIdEmpresaTransporte = et.idEmpresaTransporte
            LEFT JOIN conductores c ON t.conductorIdConductor = c.idConductor
            WHERE t.estadoTransporte = "activo"
        `);
        
        const transportesCompletos = await Promise.all(
            listaTransportes.map(async (transporte) => {
                // Obtener datos adicionales de MongoDB
                const transporteMongo = await mongo.transporteModel.findOne({ 
                    idTransporteSql: transporte.idTransporte 
                });

                return {
                    ...transporte,
                    placaTransporte: descifrarSeguro(transporte.placaTransporte),
                    modeloTransporte: descifrarSeguro(transporte.modeloTransporte),
                    marcaTransporte: descifrarSeguro(transporte.marcaTransporte),
                    detallesMongo: transporteMongo ? {
                        caracteristicas: transporteMongo.caracteristicasTransporte,
                        mantenimiento: transporteMongo.mantenimientoTransporte,
                        combustible: transporteMongo.combustibleTransporte,
                        fotos: transporteMongo.fotosTransporte,
                        especificaciones: transporteMongo.especificacionesTecnicas
                    } : null
                };
            })
        );

        return res.json(transportesCompletos);
    } catch (error) {
        console.error('Error al mostrar transportes:', error);
        return res.status(500).json({ message: 'Error al obtener los transportes', error: error.message });
    }
};

// Crear nuevo transporte
transporteCtl.crearTransporte = async (req, res) => {
    try {
        const { 
            tipoTransporte, capacidadTransporte, placaTransporte, modeloTransporte, marcaTransporte,
            categoriaTransporteId, empresaTransporteId, conductorId,
            caracteristicas, mantenimiento, combustible, fotos, especificaciones 
        } = req.body;

        // Validación de campos requeridos
        if (!tipoTransporte || !capacidadTransporte || !placaTransporte) {
            return res.status(400).json({ message: 'Tipo, capacidad y placa son obligatorios' });
        }

        // Crear en SQL con datos encriptados
        const nuevoTransporte = await orm.transporte.create({
            tipoTransporte,
            capacidadTransporte,
            placaTransporte: cifrarDatos(placaTransporte),
            modeloTransporte: cifrarDatos(modeloTransporte || ''),
            marcaTransporte: cifrarDatos(marcaTransporte || ''),
            estadoTransporte: 'activo',
            categoriaTransporteIdCategoriaTransporte: categoriaTransporteId,
            empresaTransporteIdEmpresaTransporte: empresaTransporteId,
            conductorIdConductor: conductorId,
            createTransporte: new Date().toLocaleString(),
        });

        // Crear en MongoDB con datos adicionales
        if (caracteristicas || mantenimiento || combustible || fotos || especificaciones) {
            await mongo.transporteModel.create({
                caracteristicasTransporte: caracteristicas || {},
                mantenimientoTransporte: mantenimiento || [],
                combustibleTransporte: combustible || {},
                fotosTransporte: fotos || [],
                especificacionesTecnicas: especificaciones || {},
                idTransporteSql: nuevoTransporte.idTransporte
            });
        }

        return res.status(201).json({ 
            message: 'Transporte creado exitosamente',
            idTransporte: nuevoTransporte.idTransporte
        });

    } catch (error) {
        console.error('Error al crear transporte:', error);
        return res.status(500).json({ 
            message: 'Error al crear el transporte', 
            error: error.message 
        });
    }
};

// Actualizar transporte
transporteCtl.actualizarTransporte = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            tipoTransporte, capacidadTransporte, placaTransporte, modeloTransporte, marcaTransporte,
            caracteristicas, mantenimiento, combustible, fotos, especificaciones 
        } = req.body;

        // Validar campos
        if (!tipoTransporte || !capacidadTransporte || !placaTransporte) {
            return res.status(400).json({ message: 'Datos básicos son obligatorios' });
        }

        // Actualizar en SQL
        await sql.promise().query(
            `UPDATE transportes SET 
                tipoTransporte = ?, 
                capacidadTransporte = ?, 
                placaTransporte = ?, 
                modeloTransporte = ?,
                marcaTransporte = ?,
                updateTransporte = ? 
             WHERE idTransporte = ?`,
            [
                tipoTransporte,
                capacidadTransporte,
                cifrarDatos(placaTransporte),
                cifrarDatos(modeloTransporte || ''),
                cifrarDatos(marcaTransporte || ''),
                new Date().toLocaleString(),
                id
            ]
        );

        // Actualizar en MongoDB
        if (caracteristicas || mantenimiento || combustible || fotos || especificaciones) {
            await mongo.transporteModel.updateOne(
                { idTransporteSql: id },
                {
                    $set: {
                        caracteristicasTransporte: caracteristicas || {},
                        mantenimientoTransporte: mantenimiento || [],
                        combustibleTransporte: combustible || {},
                        fotosTransporte: fotos || [],
                        especificacionesTecnicas: especificaciones || {}
                    }
                }
            );
        }

        return res.json({ message: 'Transporte actualizado exitosamente' });

    } catch (error) {
        console.error('Error al actualizar transporte:', error);
        return res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
};

// Eliminar (desactivar) transporte
transporteCtl.eliminarTransporte = async (req, res) => {
    try {
        const { id } = req.params;

        await sql.promise().query(
            `UPDATE transportes SET 
                estadoTransporte = 'inactivo', 
                updateTransporte = ? 
             WHERE idTransporte = ?`,
            [new Date().toLocaleString(), id]
        );

        return res.json({ message: 'Transporte desactivado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar transporte:', error);
        return res.status(500).json({ message: 'Error al desactivar', error: error.message });
    }
};

// Obtener transporte por ID
transporteCtl.obtenerTransporte = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [transporte] = await sql.promise().query(
            'SELECT * FROM transportes WHERE idTransporte = ? AND estadoTransporte = "activo"',
            [id]
        );

        if (transporte.length === 0) {
            return res.status(404).json({ message: 'Transporte no encontrado' });
        }

        const transporteMongo = await mongo.transporteModel.findOne({ 
            idTransporteSql: id 
        });

        const transporteCompleto = {
            ...transporte[0],
            placaTransporte: descifrarSeguro(transporte[0].placaTransporte),
            modeloTransporte: descifrarSeguro(transporte[0].modeloTransporte),
            marcaTransporte: descifrarSeguro(transporte[0].marcaTransporte),
            detallesMongo: transporteMongo || null
        };

        return res.json(transporteCompleto);
    } catch (error) {
        console.error('Error al obtener transporte:', error);
        return res.status(500).json({ message: 'Error al obtener transporte', error: error.message });
    }
};

module.exports = transporteCtl;