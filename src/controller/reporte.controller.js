const reporteCtl = {};
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

// Dashboard general
reporteCtl.dashboard = async (req, res) => {
    try {
        // Estadísticas generales
        const [estadisticas] = await sql.promise().query(`
            SELECT 
                (SELECT COUNT(*) FROM usuarios WHERE estadoUsuario = 'activo') as totalUsuarios,
                (SELECT COUNT(*) FROM transportes WHERE estadoTransporte = 'activo') as totalTransportes,
                (SELECT COUNT(*) FROM estaciones WHERE estadoEstacion = 'activo') as totalEstaciones,
                (SELECT COUNT(*) FROM rutas WHERE estadoRuta = 'activo') as totalRutas,
                (SELECT COUNT(*) FROM lugaresTuristicos WHERE estadoLugar = 'activo') as totalLugares,
                (SELECT AVG(puntajeCalificacion) FROM calificaciones WHERE estadoCalificacion = 'activo') as promedioCalificaciones
        `);

        // Top 5 rutas más calificadas
        const [topRutas] = await sql.promise().query(`
            SELECT r.nombreRuta, AVG(c.puntajeCalificacion) as promedio, COUNT(c.idCalificacion) as totalCalificaciones
            FROM rutas r
            LEFT JOIN calificaciones c ON r.idRuta = c.rutaIdRuta AND c.estadoCalificacion = 'activo'
            WHERE r.estadoRuta = 'activo'
            GROUP BY r.idRuta
            ORDER BY promedio DESC, totalCalificaciones DESC
            LIMIT 5
        `);

        // Calificaciones recientes
        const [calificacionesRecientes] = await sql.promise().query(`
            SELECT c.puntajeCalificacion, c.createCalificacion, u.nombreUsuario
            FROM calificaciones c
            LEFT JOIN usuarios u ON c.usuarioIdUsuario = u.idUsuario
            WHERE c.estadoCalificacion = 'activo'
            ORDER BY c.createCalificacion DESC
            LIMIT 10
        `);

        return res.json({
            estadisticas: estadisticas[0],
            topRutas: topRutas.map(ruta => ({
                ...ruta,
                nombreRuta: descifrarSeguro(ruta.nombreRuta)
            })),
            calificacionesRecientes: calificacionesRecientes.map(cal => ({
                ...cal,
                nombreUsuario: descifrarSeguro(cal.nombreUsuario)
            }))
        });

    } catch (error) {
        console.error('Error en dashboard:', error);
        return res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
    }
};

// Generar reporte de calificaciones
reporteCtl.reporteCalificaciones = async (req, res) => {
    try {
        const [calificaciones] = await sql.promise().query(`
            SELECT c.*, u.nombreUsuario, r.nombreRuta
            FROM calificaciones c
            LEFT JOIN usuarios u ON c.usuarioIdUsuario = u.idUsuario
            LEFT JOIN rutas r ON c.rutaIdRuta = r.idRuta
            WHERE c.estadoCalificacion = 'activo'
            ORDER BY c.createCalificacion DESC
        `);

        const calificacionesCompletas = calificaciones.map(cal => ({
            ...cal,
            nombreUsuario: descifrarSeguro(cal.nombreUsuario),
            nombreRuta: descifrarSeguro(cal.nombreRuta)
        }));

        return res.json(calificacionesCompletas);
    } catch (error) {
        console.error('Error al generar reporte de calificaciones:', error);
        return res.status(500).json({ message: 'Error al obtener calificaciones', error: error.message });
    }
};

// Generar reporte de usuarios
reporteCtl.reporteUsuarios = async (req, res) => {
    try {
        const [usuarios] = await sql.promise().query(`
            SELECT * FROM usuarios WHERE estadoUsuario = 'activo'
        `);

        const usuariosCompletos = usuarios.map(usuario => ({
            ...usuario,
            nombreUsuario: descifrarSeguro(usuario.nombreUsuario),
            emailUsuario: descifrarSeguro(usuario.emailUsuario)
        }));

        return res.json(usuariosCompletos);
    } catch (error) {
        console.error('Error al generar reporte de usuarios:', error);
        return res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
};

module.exports = reporteCtl;
