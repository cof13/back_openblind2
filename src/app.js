// Importar módulos necesarios
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const fileUpload = require("express-fileupload");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const winston = require('winston');
const fs = require('fs');
const crypto = require('crypto');
const hpp = require('hpp');
const toobusy = require('toobusy-js');
const cors = require('cors');

// Importar módulos locales
const { MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT } = require('./keys');
require('./lib/passport');

// Crear aplicación Express
const app = express();

// ==================== CONFIGURACIÓN BÁSICA ====================
app.set('port', process.env.PORT || 8888);

// Habilitar CORS (configura según tus necesidades)
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true
}));

// ==================== CONFIGURACIÓN DE LOGS MEJORADA ====================

// 1. Configuración de directorio de logs
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// 2. Configuración de Winston para logs unificados (consola y archivo)
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => {
            return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
        })
    ),
    transports: [
        // Transporte para archivo (siempre activo)
        new winston.transports.File({
            filename: path.join(logDir, 'app.log'),
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
            tailable: true
        }),
        // Transporte para consola (siempre activo)
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Sobrescribir los métodos console para redirigir a Winston
console.log = (...args) => logger.info(args.join(' '));
console.info = (...args) => logger.info(args.join(' '));
console.warn = (...args) => logger.warn(args.join(' '));
console.error = (...args) => logger.error(args.join(' '));
console.debug = (...args) => logger.debug(args.join(' '));

// 3. Configurar Morgan para usar Winston
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
    stream: {
        write: (message) => {
            // Eliminar saltos de línea innecesarios
            const cleanedMessage = message.replace(/\n$/, '');
            logger.info(cleanedMessage);
        }
    }
}));

// ==================== CONFIGURACIÓN DE SEGURIDAD MEJORADA ====================

// 4. Middleware de protección contra sobrecarga del servidor
app.use((req, res, next) => {
    if (toobusy()) {
        logger.warn('Server too busy!');
        res.status(503).json({ error: 'Server too busy. Please try again later.' });
    } else {
        next();
    }
});

// 5. Configuración de Helmet
app.use(helmet());

// 6. Protección contra HTTP Parameter Pollution
app.use(hpp());

// 7. Limitar tamaño de payload
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 8. Rate limiting para prevenir ataques de fuerza bruta
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Too many requests, please try again later.'
        });
    }
});
app.use(limiter);

// 9. Configuración avanzada de cookies
app.use(cookieParser(
    process.env.COOKIE_SECRET || crypto.randomBytes(64).toString('hex'),
    {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
    }
));

// 10. Configuración de sesiones seguras
const sessionConfig = {
    store: new MySQLStore({
        host: MYSQLHOST,
        port: MYSQLPORT,
        user: MYSQLUSER,
        password: MYSQLPASSWORD,
        database: MYSQLDATABASE,
        createDatabaseTable: true
    }),
    secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
    },
    name: 'secureSessionId',
    rolling: true,
    unset: 'destroy'
};

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    sessionConfig.cookie.secure = true;
}

app.use(session(sessionConfig));
app.use(flash());



// 12. Headers de seguridad adicionales
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Feature-Policy', "geolocation 'none'; microphone 'none'; camera 'none'");
    next();
});

// 13. Validación de entrada global
app.use((req, res, next) => {
    // Sanitizar parámetros de consulta
    for (const key in req.query) {
        if (typeof req.query[key] === 'string') {
            req.query[key] = escape(req.query[key]);
        }
    }
    
    // Sanitizar cuerpo de la petición
    if (req.body) {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = escape(req.body[key]);
            }
        }
    }
    
    next();
});

// ==================== MIDDLEWARE ADICIONAL ====================

// Configurar middleware de subida de archivos
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true,
    safeFileNames: true,
    preserveExtension: true
}));

// Middleware de compresión
app.use(compression());

// Configurar passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware para pasar datos comunes a las respuestas
app.use((req, res, next) => {
    // Para API responses en JSON
    res.apiResponse = (data, status = 200, message = '') => {
        const response = {
            success: status >= 200 && status < 300,
            message,
            data
        };
        return res.status(status).json(response);
    };
    
    res.apiError = (message, status = 400, errors = null) => {
        const response = {
            success: false,
            message,
            errors
        };
        return res.status(status).json(response);
    };
    
    next();
});

// ==================== RUTAS API ====================
// Importar y configurar rutas como API
app.use(require('./router/index'))
app.use('/pagina', require('./router/pagina.router'))
app.use('/auth', require('./router/auth.router'));
app.use('/conductor', require('./router/conductor.router'));
app.use('/horario', require('./router/horario.router'));
app.use('/empresas', require('./router/empresa.router'));
app.use('/transporte', require('./router/transporte.router'));
app.use('/ruta', require('./router/ruta.router'));
app.use('/calificacion', require('./router/calificacion.router'));
app.use('/categoria', require('./router/categoria.router'));
app.use('/estacion', require('./router/estacion.router'));
app.use('/tarifas', require('./router/tarifas.router'));
app.use('/lugares', require('./router/lugarTuristico.router'));
app.use('/mensajes', require('./router/mensaje.router'));
app.use('/guia-voz', require('./router/guiaVoz.router'));
app.use('/reporte', require('./router/reporte.router'));
app.use('/usuarios', require('./router/user.router'));
app.use('/roles', require('./router/rol.router'));
app.use('/detalle-rol', require('./router/detalleRol.router'));

// Configurar variables globales
app.use((req, res, next) => {
    app.locals.message = req.flash('message');
    app.locals.success = req.flash('success');
    app.locals.user = req.user || null;
    next();
});

// ==================== MANEJO DE ERRORES ====================

// Middleware de manejo de errores mejorado para API
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    logger.error(`Error: ${err.message}\nStack: ${err.stack}`);

    // Respuestas de error estandarizadas
    if (err.name === 'ValidationError') {
        return res.apiError('Validation error', 400, err.errors);
    }

    if (err.code === 'EBADCSRFTOKEN') {
        return res.apiError('CSRF token validation failed', 403);
    }

    // Error no manejado
    const errorResponse = {
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    };
    
    res.status(500).json(errorResponse);
});

// Middleware para rutas no encontradas (API)
app.use((req, res, next) => {
    logger.warn(`404 Not Found: ${req.originalUrl}`);
    res.apiError('Endpoint not found', 404);
});

// Exportar la aplicación
module.exports = app;