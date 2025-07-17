const empresaTransporteCtl = {};
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

// Mostrar empresas activas
empresaTransporteCtl.mostrarEmpresas = async (req, res) => {
    try {
        const [listaEmpresas] = await sql.promise().query(`
           SELECT * FROM empresasTransportes WHERE estadoEmpresa = "activo"
        `);

        const empresasCompletas = listaEmpresas.map(empresa => ({
            ...empresa,
            nombreEmpresa: descifrarSeguro(empresa.nombreEmpresa),
            rucEmpresa: descifrarSeguro(empresa.rucEmpresa),
            telefonoEmpresa: descifrarSeguro(empresa.telefonoEmpresa)
        }));

        return res.json(empresasCompletas);
    } catch (error) {
        console.error('Error al mostrar empresas:', error);
        return res.status(500).json({ message: 'Error al obtener empresas', error: error.message });
    }
};

// Crear nueva empresa de transporte
empresaTransporteCtl.crearEmpresa = async (req, res) => {
    try {
        const { nombreEmpresa, rucEmpresa, telefonoEmpresa } = req.body;

        // Validación de campos requeridos
        if (!nombreEmpresa || !rucEmpresa || !telefonoEmpresa) {
            return res.status(400).json({ message: 'Datos básicos de la empresa son obligatorios' });
        }

        // Crear en SQL con datos encriptados
        const [resultado] = await sql.promise().query(`
            INSERT INTO empresasTransportes (nombreEmpresa, rucEmpresa, telefonoEmpresa, estadoEmpresa, createEmpresa)
            VALUES (?, ?, ?, 'activo', ?)
        `, [cifrarDatos(nombreEmpresa), cifrarDatos(rucEmpresa), cifrarDatos(telefonoEmpresa), new Date().toLocaleString()]);

        return res.status(201).json({ 
            message: 'Empresa de transporte creada exitosamente',
            idEmpresa: resultado.insertId
        });

    } catch (error) {
        console.error('Error al crear empresa de transporte:', error);
        return res.status(500).json({ 
            message: 'Error al crear la empresa de transporte', 
            error: error.message 
        });
    }
};

// Actualizar empresa de transporte
empresaTransporteCtl.actualizarEmpresa = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreEmpresa, rucEmpresa, telefonoEmpresa } = req.body;

        // Validar campos
        if (!nombreEmpresa || !rucEmpresa || !telefonoEmpresa) {
            return res.status(400).json({ message: 'Datos básicos son obligatorios' });
        }

        // Actualizar en SQL
        await sql.promise().query(
            `UPDATE empresasTransporte SET 
                nombreEmpresa = ?, 
                rucEmpresa = ?, 
                telefonoEmpresa = ?, 
                updateEmpresa = ? 
             WHERE idEmpresaTransporte = ?`,
            [
                cifrarDatos(nombreEmpresa),
                cifrarDatos(rucEmpresa),
                cifrarDatos(telefonoEmpresa),
                new Date().toLocaleString(),
                id
            ]
        );

        return res.json({ message: 'Empresa de transporte actualizada exitosamente' });

    } catch (error) {
        console.error('Error al actualizar empresa de transporte:', error);
        return res.status(500).json({ message: 'Error al actualizar', error: error.message });
    }
};

// Eliminar (desactivar) empresa de transporte
empresaTransporteCtl.eliminarEmpresa = async (req, res) => {
    try {
        const { id } = req.params;

        await sql.promise().query(
            `UPDATE empresasTransporte SET 
                estadoEmpresa = 'inactivo', 
                updateEmpresa = ? 
             WHERE idEmpresaTransporte = ?`,
            [new Date().toLocaleString(), id]
        );

        return res.json({ message: 'Empresa de transporte desactivada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar empresa de transporte:', error);
        return res.status(500).json({ message: 'Error al desactivar', error: error.message });
    }
};

module.exports = empresaTransporteCtl;
