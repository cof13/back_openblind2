const categoriaCtl = {};
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

// ================ CATEGORÍAS DE TRANSPORTE ================

// Mostrar todas las categorías de transporte
categoriaCtl.mostrarcategoriasTransportes = async (req, res) => {
    try {
        const [listaCategorias] = await sql.promise().query(`
            select * from categoriasTransportes where estadoCategoria = "activo" 
        `);

        const categoriasCompletas = listaCategorias.map(categoria => ({
            ...categoria,
            nombreCategoria: descifrarSeguro(categoria.nombreCategoria),
            descripcionCategoria: descifrarSeguro(categoria.descripcionCategoria)
        }));

        return res.json(categoriasCompletas);
    } catch (error) {
        console.error('Error al mostrar categorías de transporte:', error);
        return res.status(500).json({ message: 'Error al obtener las categorías', error: error.message });
    }
};

// Crear nueva categoría de transporte
categoriaCtl.crearCategoriaTransporte = async (req, res) => {
    try {
        const { nombreCategoria, descripcionCategoria } = req.body;

        // Validación de campos requeridos
        if (!nombreCategoria) {
            return res.status(400).json({ message: 'Nombre de la categoría es obligatorio' });
        }

        // Verificar si ya existe una categoría con el mismo nombre
        const [categoriaExiste] = await sql.promise().query(
            'SELECT idCategoriaTransporte FROM categoriasTransportes WHERE nombreCategoria = ? AND estadoCategoria = "activo"',
            [cifrarDatos(nombreCategoria)]
        );

        if (categoriaExiste.length > 0) {
            return res.status(400).json({ message: 'Ya existe una categoría con este nombre' });
        }

        // Crear en SQL
        const nuevaCategoria = await orm.categoriaTransporte.create({
            nombreCategoria: cifrarDatos(nombreCategoria),
            descripcionCategoria: cifrarDatos(descripcionCategoria || ''),
            estadoCategoria: 'activo',
            createCategoria: new Date().toLocaleString(),
        });

        return res.status(201).json({ 
            message: 'Categoría de transporte creada exitosamente',
            idCategoria: nuevaCategoria.idCategoriaTransporte
        });

    } catch (error) {
        console.error('Error al crear categoría de transporte:', error);
        return res.status(500).json({ 
            message: 'Error al crear la categoría', 
            error: error.message 
        });
    }
};

// Actualizar categoría de transporte
categoriaCtl.actualizarCategoriaTransporte = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreCategoria, descripcionCategoria } = req.body;

        // Validar campos
        if (!nombreCategoria) {
            return res.status(400).json({ message: 'Nombre de la categoría es obligatorio' });
        }

        // Verificar si existe la categoría
        const [categoriaExiste] = await sql.promise().query(
            'SELECT idCategoriaTransporte FROM categoriasTransportes WHERE idCategoriaTransporte = ? AND estadoCategoria = "activo"',
            [id]
        );

        if (categoriaExiste.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        // Verificar si el nuevo nombre ya existe (excluyendo la categoría actual)
        const [nombreDuplicado] = await sql.promise().query(
            'SELECT idCategoriaTransporte FROM categoriasTransportes WHERE nombreCategoria = ? AND idCategoriaTransporte != ? AND estadoCategoria = "activo"',
            [cifrarDatos(nombreCategoria), id]
        );

        if (nombreDuplicado.length > 0) {
            return res.status(400).json({ message: 'Ya existe otra categoría con este nombre' });
        }

        // Actualizar en SQL
        await sql.promise().query(
            `UPDATE categoriasTransportes SET 
                nombreCategoria = ?, 
                descripcionCategoria = ?, 
                updateCategoria = ? 
             WHERE idCategoriaTransporte = ?`,
            [
                cifrarDatos(nombreCategoria),
                cifrarDatos(descripcionCategoria || ''),
                new Date().toLocaleString(),
                id
            ]
        );

        return res.json({ message: 'Categoría de transporte actualizada exitosamente' });

    } catch (error) {
        console.error('Error al actualizar categoría de transporte:', error);
        return res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
};

// Eliminar (desactivar) categoría de transporte
categoriaCtl.eliminarCategoriaTransporte = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si hay transportes asociados
        const [transportesAsociados] = await sql.promise().query(
            'SELECT COUNT(*) as total FROM transportes WHERE categoriaTransporteIdCategoriaTransporte = ? AND estadoTransporte = "activo"',
            [id]
        );

        if (transportesAsociados[0].total > 0) {
            return res.status(400).json({ 
                message: `No se puede eliminar la categoría. Tiene ${transportesAsociados[0].total} transporte(s) asociado(s)` 
            });
        }

        await sql.promise().query(
            `UPDATE categoriasTransportes SET 
                estadoCategoria = 'inactivo', 
                updateCategoria = ? 
             WHERE idCategoriaTransporte = ?`,
            [new Date().toLocaleString(), id]
        );

        return res.json({ message: 'Categoría de transporte desactivada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar categoría de transporte:', error);
        return res.status(500).json({ message: 'Error al desactivar', error: error.message });
    }
};

// ================ CATEGORÍAS DE ESTACIÓN ================

// Mostrar todas las categorías de estación
categoriaCtl.mostrarcategoriasEstacions = async (req, res) => {
    try {
        const [listaCategorias] = await sql.promise().query(`
            Select * from categoriasEstacions where estadoCategoriaEstacion = "activo"
        `);

        const categoriasCompletas = listaCategorias.map(categoria => ({
            ...categoria,
            nombreCategoriaEstacion: descifrarSeguro(categoria.nombreCategoriaEstacion),
            descripcionCategoriaEstacion: descifrarSeguro(categoria.descripcionCategoriaEstacion)
        }));

        return res.json(categoriasCompletas);
    } catch (error) {
        console.error('Error al mostrar categorías de estación:', error);
        return res.status(500).json({ message: 'Error al obtener las categorías', error: error.message });
    }
};

// Crear nueva categoría de estación
categoriaCtl.crearCategoriaEstacion = async (req, res) => {
    try {
        const { nombreCategoriaEstacion, descripcionCategoriaEstacion } = req.body;

        // Validación de campos requeridos
        if (!nombreCategoriaEstacion) {
            return res.status(400).json({ message: 'Nombre de la categoría es obligatorio' });
        }

        // Verificar si ya existe una categoría con el mismo nombre
        const [categoriaExiste] = await sql.promise().query(
            'SELECT idCategoriaEstacion FROM categoriasEstacions WHERE nombreCategoriaEstacion = ? AND estadoCategoriaEstacion = "activo"',
            [cifrarDatos(nombreCategoriaEstacion)]
        );

        if (categoriaExiste.length > 0) {
            return res.status(400).json({ message: 'Ya existe una categoría con este nombre' });
        }

        // Crear en SQL
        const nuevaCategoria = await orm.categoriaEstacion.create({
            nombreCategoriaEstacion: cifrarDatos(nombreCategoriaEstacion),
            descripcionCategoriaEstacion: cifrarDatos(descripcionCategoriaEstacion || ''),
            estadoCategoriaEstacion: 'activo',
            createCategoriaEstacion: new Date().toLocaleString(),
        });

        return res.status(201).json({ 
            message: 'Categoría de estación creada exitosamente',
            idCategoria: nuevaCategoria.idCategoriaEstacion
        });

    } catch (error) {
        console.error('Error al crear categoría de estación:', error);
        return res.status(500).json({ 
            message: 'Error al crear la categoría', 
            error: error.message 
        });
    }
};

// Actualizar categoría de estación
categoriaCtl.actualizarCategoriaEstacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreCategoriaEstacion, descripcionCategoriaEstacion } = req.body;

        // Validar campos
        if (!nombreCategoriaEstacion) {
            return res.status(400).json({ message: 'Nombre de la categoría es obligatorio' });
        }

        // Verificar si existe la categoría
        const [categoriaExiste] = await sql.promise().query(
            'SELECT idCategoriaEstacion FROM categoriasEstacions WHERE idCategoriaEstacion = ? AND estadoCategoriaEstacion = "activo"',
            [id]
        );

        if (categoriaExiste.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        // Verificar si el nuevo nombre ya existe (excluyendo la categoría actual)
        const [nombreDuplicado] = await sql.promise().query(
            'SELECT idCategoriaEstacion FROM categoriasEstacions WHERE nombreCategoriaEstacion = ? AND idCategoriaEstacion != ? AND estadoCategoriaEstacion = "activo"',
            [cifrarDatos(nombreCategoriaEstacion), id]
        );

        if (nombreDuplicado.length > 0) {
            return res.status(400).json({ message: 'Ya existe otra categoría con este nombre' });
        }

        // Actualizar en SQL
        await sql.promise().query(
            `UPDATE categoriasEstacions SET 
                nombreCategoriaEstacion = ?, 
                descripcionCategoriaEstacion = ?, 
                updateCategoriaEstacion = ? 
             WHERE idCategoriaEstacion = ?`,
            [
                cifrarDatos(nombreCategoriaEstacion),
                cifrarDatos(descripcionCategoriaEstacion || ''),
                new Date().toLocaleString(),
                id
            ]
        );

        return res.json({ message: 'Categoría de estación actualizada exitosamente' });

    } catch (error) {
        console.error('Error al actualizar categoría de estación:', error);
        return res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
};

// Eliminar (desactivar) categoría de estación
categoriaCtl.eliminarCategoriaEstacion = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si hay estaciones asociadas
        const [estacionesAsociadas] = await sql.promise().query(
            'SELECT COUNT(*) as total FROM estaciones WHERE categoriaEstacionIdCategoriaEstacion = ? AND estadoEstacion = "activo"',
            [id]
        );

        if (estacionesAsociadas[0].total > 0) {
            return res.status(400).json({ 
                message: `No se puede eliminar la categoría. Tiene ${estacionesAsociadas[0].total} estación(es) asociada(s)` 
            });
        }

        await sql.promise().query(
            `UPDATE categoriasEstacions SET 
                estadoCategoriaEstacion = 'inactivo', 
                updateCategoriaEstacion = ? 
             WHERE idCategoriaEstacion = ?`,
            [new Date().toLocaleString(), id]
        );

        return res.json({ message: 'Categoría de estación desactivada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar categoría de estación:', error);
        return res.status(500).json({ message: 'Error al desactivar', error: error.message });
    }
};

// ================ CATEGORÍAS DE LUGAR TURÍSTICO ================

// Mostrar todas las categorías de lugar turístico
categoriaCtl.mostrarcategoriasLugars = async (req, res) => {
    try {
        const [listaCategorias] = await sql.promise().query(`
           select * from categoriasLugars where estadoCategoriaLugar = "activo"
        `);

        const categoriasCompletas = listaCategorias.map(categoria => ({
            ...categoria,
            nombreCategoriaLugar: descifrarSeguro(categoria.nombreCategoriaLugar),
            descripcionCategoriaLugar: descifrarSeguro(categoria.descripcionCategoriaLugar)
        }));

        return res.json(categoriasCompletas);
    } catch (error) {
        console.error('Error al mostrar categorías de lugar:', error);
        return res.status(500).json({ message: 'Error al obtener las categorías', error: error.message });
    }
};

// Crear nueva categoría de lugar turístico
categoriaCtl.crearCategoriaLugar = async (req, res) => {
    try {
        const { nombreCategoriaLugar, descripcionCategoriaLugar } = req.body;

        // Validación de campos requeridos
        if (!nombreCategoriaLugar) {
            return res.status(400).json({ message: 'Nombre de la categoría es obligatorio' });
        }

        // Verificar si ya existe una categoría con el mismo nombre
        const [categoriaExiste] = await sql.promise().query(
            'SELECT idCategoriaLugar FROM categoriasLugars WHERE nombreCategoriaLugar = ? AND estadoCategoriaLugar = "activo"',
            [cifrarDatos(nombreCategoriaLugar)]
        );

        if (categoriaExiste.length > 0) {
            return res.status(400).json({ message: 'Ya existe una categoría con este nombre' });
        }

        // Crear en SQL
        const nuevaCategoria = await orm.categoriaLugar.create({
            nombreCategoriaLugar: cifrarDatos(nombreCategoriaLugar),
            descripcionCategoriaLugar: cifrarDatos(descripcionCategoriaLugar || ''),
            estadoCategoriaLugar: 'activo',
            createCategoriaLugar: new Date().toLocaleString(),
        });

        return res.status(201).json({ 
            message: 'Categoría de lugar turístico creada exitosamente',
            idCategoria: nuevaCategoria.idCategoriaLugar
        });

    } catch (error) {
        console.error('Error al crear categoría de lugar:', error);
        return res.status(500).json({ 
            message: 'Error al crear la categoría', 
            error: error.message 
        });
    }
};

// Actualizar categoría de lugar turístico
categoriaCtl.actualizarCategoriaLugar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreCategoriaLugar, descripcionCategoriaLugar } = req.body;

        // Validar campos
        if (!nombreCategoriaLugar) {
            return res.status(400).json({ message: 'Nombre de la categoría es obligatorio' });
        }

        // Verificar si existe la categoría
        const [categoriaExiste] = await sql.promise().query(
            'SELECT idCategoriaLugar FROM categoriasLugars WHERE idCategoriaLugar = ? AND estadoCategoriaLugar = "activo"',
            [id]
        );

        if (categoriaExiste.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        // Verificar si el nuevo nombre ya existe (excluyendo la categoría actual)
        const [nombreDuplicado] = await sql.promise().query(
            'SELECT idCategoriaLugar FROM categoriasLugars WHERE nombreCategoriaLugar = ? AND idCategoriaLugar != ? AND estadoCategoriaLugar = "activo"',
            [cifrarDatos(nombreCategoriaLugar), id]
        );

        if (nombreDuplicado.length > 0) {
            return res.status(400).json({ message: 'Ya existe otra categoría con este nombre' });
        }

        // Actualizar en SQL
        await sql.promise().query(
            `UPDATE categoriasLugars SET 
                nombreCategoriaLugar = ?, 
                descripcionCategoriaLugar = ?, 
                updateCategoriaLugar = ? 
             WHERE idCategoriaLugar = ?`,
            [
                cifrarDatos(nombreCategoriaLugar),
                cifrarDatos(descripcionCategoriaLugar || ''),
                new Date().toLocaleString(),
                id
            ]
        );

        return res.json({ message: 'Categoría de lugar turístico actualizada exitosamente' });

    } catch (error) {
        console.error('Error al actualizar categoría de lugar:', error);
        return res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
};

// Eliminar (desactivar) categoría de lugar turístico
categoriaCtl.eliminarCategoriaLugar = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si hay lugares turísticos asociados
        const [lugaresAsociados] = await sql.promise().query(
            'SELECT COUNT(*) as total FROM lugaresTuristicos WHERE categoriaLugarIdCategoriaLugar = ? AND estadoLugar = "activo"',
            [id]
        );

        if (lugaresAsociados[0].total > 0) {
            return res.status(400).json({ 
                message: `No se puede eliminar la categoría. Tiene ${lugaresAsociados[0].total} lugar(es) turístico(s) asociado(s)` 
            });
        }

        await sql.promise().query(
            `UPDATE categoriasLugars SET 
                estadoCategoriaLugar = 'inactivo', 
                updateCategoriaLugar = ? 
             WHERE idCategoriaLugar = ?`,
            [new Date().toLocaleString(), id]
        );

        return res.json({ message: 'Categoría de lugar turístico desactivada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar categoría de lugar:', error);
        return res.status(500).json({ message: 'Error al desactivar', error: error.message });
    }
};

// ================ TIPOS DE MENSAJE ================

// Mostrar todos los tipos de mensaje
categoriaCtl.mostrartiposMensajes = async (req, res) => {
    try {
        const [listaTipos] = await sql.promise().query(`
            select * from tiposMensajes where estadoTipoMensaje = "activo"
        `);

        const tiposCompletos = listaTipos.map(tipo => ({
            ...tipo,
            nombreTipoMensaje: descifrarSeguro(tipo.nombreTipoMensaje),
            descripcionTipoMensaje: descifrarSeguro(tipo.descripcionTipoMensaje)
        }));

        return res.json(tiposCompletos);
    } catch (error) {
        console.error('Error al mostrar tipos de mensaje:', error);
        return res.status(500).json({ message: 'Error al obtener los tipos', error: error.message });
    }
};

// Crear nuevo tipo de mensaje
categoriaCtl.crearTipoMensaje = async (req, res) => {
    try {
        const { nombreTipoMensaje, descripcionTipoMensaje } = req.body;

        // Validación de campos requeridos
        if (!nombreTipoMensaje) {
            return res.status(400).json({ message: 'Nombre del tipo es obligatorio' });
        }

        // Verificar si ya existe un tipo con el mismo nombre
        const [tipoExiste] = await sql.promise().query(
            'SELECT idTipoMensaje FROM tiposMensajes WHERE nombreTipoMensaje = ? AND estadoTipoMensaje = "activo"',
            [cifrarDatos(nombreTipoMensaje)]
        );

        if (tipoExiste.length > 0) {
            return res.status(400).json({ message: 'Ya existe un tipo con este nombre' });
        }

        // Crear en SQL
        const nuevoTipo = await orm.tipoMensaje.create({
            nombreTipoMensaje: cifrarDatos(nombreTipoMensaje),
            descripcionTipoMensaje: cifrarDatos(descripcionTipoMensaje || ''),
            estadoTipoMensaje: 'activo',
            createTipoMensaje: new Date().toLocaleString(),
        });

        return res.status(201).json({ 
            message: 'Tipo de mensaje creado exitosamente',
            idTipo: nuevoTipo.idTipoMensaje
        });

    } catch (error) {
        console.error('Error al crear tipo de mensaje:', error);
        return res.status(500).json({ 
            message: 'Error al crear el tipo', 
            error: error.message 
        });
    }
};

// ================ MÉTODOS DE INGRESO ================

// Mostrar todos los métodos de ingreso
categoriaCtl.mostrarmetodosIngresos = async (req, res) => {
    try {
        const [listaMetodos] = await sql.promise().query(`
            select * from metodosIngresos where estadoMetodo = "activo"
        `);

        const metodosCompletos = listaMetodos.map(metodo => ({
            ...metodo,
            nombreMetodo: descifrarSeguro(metodo.nombreMetodo),
            descripcionMetodo: descifrarSeguro(metodo.descripcionMetodo)
        }));

        return res.json(metodosCompletos);
    } catch (error) {
        console.error('Error al mostrar métodos de ingreso:', error);
        return res.status(500).json({ message: 'Error al obtener los métodos', error: error.message });
    }
};

// Crear nuevo método de ingreso
categoriaCtl.crearMetodoIngreso = async (req, res) => {
    try {
        const { nombreMetodo, descripcionMetodo } = req.body;

        // Validación de campos requeridos
        if (!nombreMetodo) {
            return res.status(400).json({ message: 'Nombre del método es obligatorio' });
        }

        // Verificar si ya existe un método con el mismo nombre
        const [metodoExiste] = await sql.promise().query(
            'SELECT idMetodoIngreso FROM metodosIngresos WHERE nombreMetodo = ? AND estadoMetodo = "activo"',
            [cifrarDatos(nombreMetodo)]
        );

        if (metodoExiste.length > 0) {
            return res.status(400).json({ message: 'Ya existe un método con este nombre' });
        }

        // Crear en SQL
        const nuevoMetodo = await orm.metodoIngreso.create({
            nombreMetodo: cifrarDatos(nombreMetodo),
            descripcionMetodo: cifrarDatos(descripcionMetodo || ''),
            estadoMetodo: 'activo',
            createMetodo: new Date().toLocaleString(),
        });

        return res.status(201).json({ 
            message: 'Método de ingreso creado exitosamente',
            idMetodo: nuevoMetodo.idMetodoIngreso
        });

    } catch (error) {
        console.error('Error al crear método de ingreso:', error);
        return res.status(500).json({ 
            message: 'Error al crear el método', 
            error: error.message 
        });
    }
};

// ================ IDIOMAS ================

// Mostrar todos los idiomas
categoriaCtl.mostrarIdiomas = async (req, res) => {
    try {
        const [listaIdiomas] = await sql.promise().query(`
            SELECT i.*,
                   COUNT(gv.idGuiaVoz) as totalGuias
            FROM idiomas i
            LEFT JOIN guiasVoz gv ON i.idIdioma = gv.idiomaIdIdioma 
                AND gv.estadoGuiaVoz = 'activo'
            WHERE i.estadoIdioma = "activo"
            GROUP BY i.idIdioma
            ORDER BY i.nombreIdioma
        `);

        const idiomasCompletos = listaIdiomas.map(idioma => ({
            ...idioma,
            nombreIdioma: descifrarSeguro(idioma.nombreIdioma),
            codigoIdioma: descifrarSeguro(idioma.codigoIdioma)
        }));

        return res.json(idiomasCompletos);
    } catch (error) {
        console.error('Error al mostrar idiomas:', error);
        return res.status(500).json({ message: 'Error al obtener los idiomas', error: error.message });
    }
};

// Crear nuevo idioma
categoriaCtl.crearIdioma = async (req, res) => {
    try {
        const { nombreIdioma, codigoIdioma } = req.body;

        // Validación de campos requeridos
        if (!nombreIdioma || !codigoIdioma) {
            return res.status(400).json({ message: 'Nombre y código del idioma son obligatorios' });
        }

        // Verificar si ya existe un idioma con el mismo nombre o código
        const [idiomaExiste] = await sql.promise().query(
            'SELECT idIdioma FROM idiomas WHERE (nombreIdioma = ? OR codigoIdioma = ?) AND estadoIdioma = "activo"',
            [cifrarDatos(nombreIdioma), cifrarDatos(codigoIdioma)]
        );

        if (idiomaExiste.length > 0) {
            return res.status(400).json({ message: 'Ya existe un idioma con este nombre o código' });
        }

        // Crear en SQL
        const nuevoIdioma = await orm.idioma.create({
            nombreIdioma: cifrarDatos(nombreIdioma),
            codigoIdioma: cifrarDatos(codigoIdioma),
            estadoIdioma: 'activo',
            createIdioma: new Date().toLocaleString(),
        });

        return res.status(201).json({ 
            message: 'Idioma creado exitosamente',
            idIdioma: nuevoIdioma.idIdioma
        });

    } catch (error) {
        console.error('Error al crear idioma:', error);
        return res.status(500).json({ 
            message: 'Error al crear el idioma', 
            error: error.message 
        });
    }
};

// ================ FUNCIONES GENÉRICAS ================

// Obtener todas las categorías (resumen)
categoriaCtl.obtenerTodasLasCategorias = async (req, res) => {
    try {
        const [categoriasTransportes] = await sql.promise().query(
            'SELECT idCategoriaTransporte as id, nombreCategoria as nombre, "transporte" as tipo FROM categoriasTransportes WHERE estadoCategoria = "activo"'
        );

        const [categoriasEstacions] = await sql.promise().query(
            'SELECT idCategoriaEstacion as id, nombreCategoriaEstacion as nombre, "estacion" as tipo FROM categoriasEstacions WHERE estadoCategoriaEstacion = "activo"'
        );

        const [categoriasLugars] = await sql.promise().query(
            'SELECT idCategoriaLugar as id, nombreCategoriaLugar as nombre, "lugar" as tipo FROM categoriasLugars WHERE estadoCategoriaLugar = "activo"'
        );

        const [tiposMensajes] = await sql.promise().query(
            'SELECT idTipoMensaje as id, nombreTipoMensaje as nombre, "mensaje" as tipo FROM tiposMensajes WHERE estadoTipoMensaje = "activo"'
        );

        const [metodosIngresos] = await sql.promise().query(
            'SELECT idMetodoIngreso as id, nombreMetodo as nombre, "metodo_ingreso" as tipo FROM metodosIngresos WHERE estadoMetodo = "activo"'
        );

        const [idiomas] = await sql.promise().query(
            'SELECT idIdioma as id, nombreIdioma as nombre, "idioma" as tipo FROM idiomas WHERE estadoIdioma = "activo"'
        );

        const todasLasCategorias = {
            categoriasTransportes: categoriasTransportes.map(cat => ({
                ...cat,
                nombre: descifrarSeguro(cat.nombre)
            })),
            categoriasEstacions: categoriasEstacions.map(cat => ({
                ...cat,
                nombre: descifrarSeguro(cat.nombre)
            })),
            categoriasLugars: categoriasLugars.map(cat => ({
                ...cat,
                nombre: descifrarSeguro(cat.nombre)
            })),
            tiposMensajes: tiposMensajes.map(tipo => ({
                ...tipo,
                nombre: descifrarSeguro(tipo.nombre)
            })),
            metodosIngresos: metodosIngresos.map(metodo => ({
                ...metodo,
                nombre: descifrarSeguro(metodo.nombre)
            })),
            idiomas: idiomas.map(idioma => ({
                ...idioma,
                nombre: descifrarSeguro(idioma.nombre)
            }))
        };

        return res.json(todasLasCategorias);
    } catch (error) {
        console.error('Error al obtener todas las categorías:', error);
        return res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
    }
};

// Buscar categorías por nombre
categoriaCtl.buscarCategorias = async (req, res) => {
    try {
        const { q, tipo } = req.query; // q = query, tipo = filtro opcional

        if (!q || q.length < 2) {
            return res.status(400).json({ message: 'Consulta debe tener al menos 2 caracteres' });
        }

        let resultados = [];

        // Buscar en categorías de transporte
        if (!tipo || tipo === 'transporte') {
            const [categoriasTransportes] = await sql.promise().query(`
                SELECT idCategoriaTransporte as id, nombreCategoria as nombre, descripcionCategoria as descripcion, "transporte" as tipo
                FROM categoriasTransportes 
                WHERE nombreCategoria LIKE ? AND estadoCategoria = "activo"
                LIMIT 10
            `, [`%${q}%`]);

            resultados.push(...categoriasTransportes.map(cat => ({
                ...cat,
                nombre: descifrarSeguro(cat.nombre),
                descripcion: descifrarSeguro(cat.descripcion)
            })));
        }

        // Buscar en categorías de estación
        if (!tipo || tipo === 'estacion') {
            const [categoriasEstacions] = await sql.promise().query(`
                SELECT idCategoriaEstacion as id, nombreCategoriaEstacion as nombre, descripcionCategoriaEstacion as descripcion, "estacion" as tipo
                FROM categoriasEstacions 
                WHERE nombreCategoriaEstacion LIKE ? AND estadoCategoriaEstacion = "activo"
                LIMIT 10
            `, [`%${q}%`]);

            resultados.push(...categoriasEstacions.map(cat => ({
                ...cat,
                nombre: descifrarSeguro(cat.nombre),
                descripcion: descifrarSeguro(cat.descripcion)
            })));
        }

        // Buscar en categorías de lugar
        if (!tipo || tipo === 'lugar') {
            const [categoriasLugars] = await sql.promise().query(`
                SELECT idCategoriaLugar as id, nombreCategoriaLugar as nombre, descripcionCategoriaLugar as descripcion, "lugar" as tipo
                FROM categoriasLugars 
                WHERE nombreCategoriaLugar LIKE ? AND estadoCategoriaLugar = "activo"
                LIMIT 10
            `, [`%${q}%`]);

            resultados.push(...categoriasLugars.map(cat => ({
                ...cat,
                nombre: descifrarSeguro(cat.nombre),
                descripcion: descifrarSeguro(cat.descripcion)
            })));
        }

        return res.json(resultados);
    } catch (error) {
        console.error('Error al buscar categorías:', error);
        return res.status(500).json({ message: 'Error en la búsqueda', error: error.message });
    }
};

// Estadísticas de categorías
categoriaCtl.obtenerEstadisticas = async (req, res) => {
    try {
        const [estadisticas] = await sql.promise().query(`
            SELECT 
                (SELECT COUNT(*) FROM categoriasTransportes WHERE estadoCategoria = 'activo') as totalcategoriasTransportes,
                (SELECT COUNT(*) FROM categoriasEstacions WHERE estadoCategoriaEstacion = 'activo') as totalcategoriasEstacions,
                (SELECT COUNT(*) FROM categoriasLugars WHERE estadoCategoriaLugar = 'activo') as totalcategoriasLugars,
                (SELECT COUNT(*) FROM tiposMensajes WHERE estadoTipoMensaje = 'activo') as totaltiposMensajes,
                (SELECT COUNT(*) FROM metodosIngresos WHERE estadoMetodo = 'activo') as totalmetodosIngresos,
                (SELECT COUNT(*) FROM idiomas WHERE estadoIdioma = 'activo') as totalIdiomas
        `);

        // Categorías más utilizadas
        const [categoriasPopulares] = await sql.promise().query(`
            SELECT 
                'transporte' as tipo,
                ct.nombreCategoria as nombre,
                COUNT(t.idTransporte) as uso
            FROM categoriasTransportes ct
            LEFT JOIN transportes t ON ct.idCategoriaTransporte = t.categoriaTransporteIdCategoriaTransporte AND t.estadoTransporte = 'activo'
            WHERE ct.estadoCategoria = 'activo'
            GROUP BY ct.idCategoriaTransporte
            
            UNION ALL
            
            SELECT 
                'estacion' as tipo,
                ce.nombreCategoriaEstacion as nombre,
                COUNT(e.idEstacion) as uso
            FROM categoriasEstacions ce
            LEFT JOIN estaciones e ON ce.idCategoriaEstacion = e.categoriaEstacionIdCategoriaEstacion AND e.estadoEstacion = 'activo'
            WHERE ce.estadoCategoriaEstacion = 'activo'
            GROUP BY ce.idCategoriaEstacion
            
            UNION ALL
            
            SELECT 
                'lugar' as tipo,
                cl.nombreCategoriaLugar as nombre,
                COUNT(lt.idLugarTuristico) as uso
            FROM categoriasLugars cl
            LEFT JOIN lugaresTuristicos lt ON cl.idCategoriaLugar = lt.categoriaLugarIdCategoriaLugar AND lt.estadoLugar = 'activo'
            WHERE cl.estadoCategoriaLugar = 'activo'
            GROUP BY cl.idCategoriaLugar
            
            ORDER BY uso DESC
            LIMIT 10
        `);

        return res.json({
            estadisticas: estadisticas[0],
            categoriasPopulares: categoriasPopulares.map(cat => ({
                ...cat,
                nombre: descifrarSeguro(cat.nombre)
            }))
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
    }
};

// ================ FUNCIONES DE VALIDACIÓN ================

// Validar existencia de categoría de transporte
categoriaCtl.validarCategoriaTransporte = async (req, res) => {
    try {
        const { id } = req.params;

        const [categoria] = await sql.promise().query(
            'SELECT * FROM categoriasTransportes WHERE idCategoriaTransporte = ? AND estadoCategoria = "activo"',
            [id]
        );

        if (categoria.length === 0) {
            return res.status(404).json({ message: 'Categoría de transporte no encontrada', valida: false });
        }

        return res.json({
            valida: true,
            categoria: {
                ...categoria[0],
                nombreCategoria: descifrarSeguro(categoria[0].nombreCategoria),
                descripcionCategoria: descifrarSeguro(categoria[0].descripcionCategoria)
            }
        });
    } catch (error) {
        console.error('Error al validar categoría:', error);
        return res.status(500).json({ message: 'Error en validación', error: error.message });
    }
};

// Validar existencia de categoría de estación
categoriaCtl.validarCategoriaEstacion = async (req, res) => {
    try {
        const { id } = req.params;

        const [categoria] = await sql.promise().query(
            'SELECT * FROM categoriasEstacions WHERE idCategoriaEstacion = ? AND estadoCategoriaEstacion = "activo"',
            [id]
        );

        if (categoria.length === 0) {
            return res.status(404).json({ message: 'Categoría de estación no encontrada', valida: false });
        }

        return res.json({
            valida: true,
            categoria: {
                ...categoria[0],
                nombreCategoriaEstacion: descifrarSeguro(categoria[0].nombreCategoriaEstacion),
                descripcionCategoriaEstacion: descifrarSeguro(categoria[0].descripcionCategoriaEstacion)
            }
        });
    } catch (error) {
        console.error('Error al validar categoría:', error);
        return res.status(500).json({ message: 'Error en validación', error: error.message });
    }
};

// Validar existencia de categoría de lugar
categoriaCtl.validarCategoriaLugar = async (req, res) => {
    try {
        const { id } = req.params;

        const [categoria] = await sql.promise().query(
            'SELECT * FROM categoriasLugars WHERE idCategoriaLugar = ? AND estadoCategoriaLugar = "activo"',
            [id]
        );

        if (categoria.length === 0) {
            return res.status(404).json({ message: 'Categoría de lugar no encontrada', valida: false });
        }

        return res.json({
            valida: true,
            categoria: {
                ...categoria[0],
                nombreCategoriaLugar: descifrarSeguro(categoria[0].nombreCategoriaLugar),
                descripcionCategoriaLugar: descifrarSeguro(categoria[0].descripcionCategoriaLugar)
            }
        });
    } catch (error) {
        console.error('Error al validar categoría:', error);
        return res.status(500).json({ message: 'Error en validación', error: error.message });
    }
};

// ================ OPERACIONES MASIVAS ================

// Crear categorías por defecto del sistema
categoriaCtl.crearCategoriasPorDefecto = async (req, res) => {
    try {
        const transaction = await sql.promise().beginTransaction();

        try {
            // Categorías de transporte por defecto
            const categoriasTransportesDefecto = [
                { nombre: 'Bus Urbano', descripcion: 'Autobuses para transporte dentro de la ciudad' },
                { nombre: 'Bus Interurbano', descripcion: 'Autobuses para transporte entre ciudades' },
                { nombre: 'Metro', descripcion: 'Sistema de transporte subterráneo' },
                { nombre: 'Tranvía', descripcion: 'Sistema de transporte sobre rieles en superficie' },
                { nombre: 'Bus Articulado', descripcion: 'Autobuses de gran capacidad articulados' }
            ];

            for (const categoria of categoriasTransportesDefecto) {
                const [existe] = await sql.promise().query(
                    'SELECT idCategoriaTransporte FROM categoriasTransportes WHERE nombreCategoria = ?',
                    [cifrarDatos(categoria.nombre)]
                );

                if (existe.length === 0) {
                    await orm.categoriaTransporte.create({
                        nombreCategoria: cifrarDatos(categoria.nombre),
                        descripcionCategoria: cifrarDatos(categoria.descripcion),
                        estadoCategoria: 'activo',
                        createCategoria: new Date().toLocaleString(),
                    }, { transaction });
                }
            }

            // Categorías de estación por defecto
            const categoriasEstacionsDefecto = [
                { nombre: 'Terminal Principal', descripcion: 'Estación principal de la red' },
                { nombre: 'Estación Intermedia', descripcion: 'Estación de paso en la ruta' },
                { nombre: 'Estación de Transferencia', descripcion: 'Estación para cambio de rutas' },
                { nombre: 'Parada Simple', descripcion: 'Parada básica sin servicios adicionales' }
            ];

            for (const categoria of categoriasEstacionsDefecto) {
                const [existe] = await sql.promise().query(
                    'SELECT idCategoriaEstacion FROM categoriasEstacions WHERE nombreCategoriaEstacion = ?',
                    [cifrarDatos(categoria.nombre)]
                );

                if (existe.length === 0) {
                    await orm.categoriaEstacion.create({
                        nombreCategoriaEstacion: cifrarDatos(categoria.nombre),
                        descripcionCategoriaEstacion: cifrarDatos(categoria.descripcion),
                        estadoCategoriaEstacion: 'activo',
                        createCategoriaEstacion: new Date().toLocaleString(),
                    }, { transaction });
                }
            }

            // Categorías de lugar turístico por defecto
            const categoriasLugarsDefecto = [
                { nombre: 'Museo', descripcion: 'Espacios culturales y educativos' },
                { nombre: 'Parque', descripcion: 'Áreas verdes y recreativas' },
                { nombre: 'Monumento', descripcion: 'Monumentos históricos y conmemorativos' },
                { nombre: 'Centro Comercial', descripcion: 'Centros de compras y entretenimiento' },
                { nombre: 'Plaza', descripcion: 'Espacios públicos y plazas principales' },
                { nombre: 'Iglesia', descripcion: 'Templos y edificaciones religiosas' },
                { nombre: 'Teatro', descripcion: 'Espacios para artes escénicas' }
            ];

            for (const categoria of categoriasLugarsDefecto) {
                const [existe] = await sql.promise().query(
                    'SELECT idCategoriaLugar FROM categoriasLugars WHERE nombreCategoriaLugar = ?',
                    [cifrarDatos(categoria.nombre)]
                );

                if (existe.length === 0) {
                    await orm.categoriaLugar.create({
                        nombreCategoriaLugar: cifrarDatos(categoria.nombre),
                        descripcionCategoriaLugar: cifrarDatos(categoria.descripcion),
                        estadoCategoriaLugar: 'activo',
                        createCategoriaLugar: new Date().toLocaleString(),
                    }, { transaction });
                }
            }

            // Tipos de mensaje por defecto
            const tiposMensajesDefecto = [
                { nombre: 'Informativo', descripcion: 'Mensajes informativos generales' },
                { nombre: 'Urgente', descripcion: 'Mensajes urgentes o de emergencia' },
                { nombre: 'Mantenimiento', descripcion: 'Avisos de mantenimiento del sistema' },
                { nombre: 'Promocional', descripcion: 'Mensajes promocionales y ofertas' },
                { nombre: 'Seguridad', descripcion: 'Mensajes relacionados con seguridad' }
            ];

            for (const tipo of tiposMensajesDefecto) {
                const [existe] = await sql.promise().query(
                    'SELECT idTipoMensaje FROM tiposMensajes WHERE nombreTipoMensaje = ?',
                    [cifrarDatos(tipo.nombre)]
                );

                if (existe.length === 0) {
                    await orm.tipoMensaje.create({
                        nombreTipoMensaje: cifrarDatos(tipo.nombre),
                        descripcionTipoMensaje: cifrarDatos(tipo.descripcion),
                        estadoTipoMensaje: 'activo',
                        createTipoMensaje: new Date().toLocaleString(),
                    }, { transaction });
                }
            }

            // Métodos de ingreso por defecto
            const metodosIngresosDefecto = [
                { nombre: 'Tarjeta RFID', descripcion: 'Tarjeta de proximidad para acceso' },
                { nombre: 'Código QR', descripcion: 'Código QR desde dispositivo móvil' },
                { nombre: 'Efectivo', descripcion: 'Pago en efectivo al conductor' },
                { nombre: 'Tarjeta de Crédito', descripcion: 'Pago con tarjeta de crédito/débito' },
                { nombre: 'App Móvil', descripcion: 'Aplicación móvil del sistema' }
            ];

            for (const metodo of metodosIngresosDefecto) {
                const [existe] = await sql.promise().query(
                    'SELECT idMetodoIngreso FROM metodosIngresos WHERE nombreMetodo = ?',
                    [cifrarDatos(metodo.nombre)]
                );

                if (existe.length === 0) {
                    await orm.metodoIngreso.create({
                        nombreMetodo: cifrarDatos(metodo.nombre),
                        descripcionMetodo: cifrarDatos(metodo.descripcion),
                        estadoMetodo: 'activo',
                        createMetodo: new Date().toLocaleString(),
                    }, { transaction });
                }
            }

            // Idiomas por defecto
            const idiomasDefecto = [
                { nombre: 'Español', codigo: 'es' },
                { nombre: 'Inglés', codigo: 'en' },
                { nombre: 'Francés', codigo: 'fr' },
                { nombre: 'Quechua', codigo: 'qu' },
                { nombre: 'Portugués', codigo: 'pt' }
            ];

            for (const idioma of idiomasDefecto) {
                const [existe] = await sql.promise().query(
                    'SELECT idIdioma FROM idiomas WHERE codigoIdioma = ?',
                    [cifrarDatos(idioma.codigo)]
                );

                if (existe.length === 0) {
                    await orm.idioma.create({
                        nombreIdioma: cifrarDatos(idioma.nombre),
                        codigoIdioma: cifrarDatos(idioma.codigo),
                        estadoIdioma: 'activo',
                        createIdioma: new Date().toLocaleString(),
                    }, { transaction });
                }
            }

            await transaction.commit();

            return res.status(201).json({ 
                message: 'Categorías por defecto creadas exitosamente'
            });

        } catch (error) {
            await transaction.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error al crear categorías por defecto:', error);
        return res.status(500).json({ 
            message: 'Error al crear categorías por defecto', 
            error: error.message 
        });
    }
};

module.exports = categoriaCtl;