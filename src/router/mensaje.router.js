const express = require('express');
const router = express.Router();

const { 
    mostrarMensajes, 
    crearMensaje, 
    actualizarMensaje, 
    eliminarMensaje,
    obtenerMensaje,
    obtenerPorTipo,
    marcarComoVisto,
    marcarComoLeido,
    obtenerMensajesUrgentes
} = require('../controller/mensaje.controller');

// Obtener todos los mensajes
router.get('/lista', mostrarMensajes);

// Obtener un mensaje específico
router.get('/obtener/:id', obtenerMensaje);

// Obtener mensajes por tipo
router.get('/tipo/:tipoId', obtenerPorTipo);

// Obtener mensajes urgentes
router.get('/urgentes', obtenerMensajesUrgentes);

// Crear nuevo mensaje
router.post('/crear', crearMensaje);

// Marcar mensaje como visto
router.post('/visto/:id', marcarComoVisto);

// Marcar mensaje como leído
router.post('/leido/:id', marcarComoLeido);

// Actualizar un mensaje existente
router.put('/actualizar/:id', actualizarMensaje);

// Eliminar (desactivar) un mensaje
router.delete('/eliminar/:id', eliminarMensaje);

module.exports = router;