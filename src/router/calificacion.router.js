const express = require('express');
const router = express.Router();

const { 
    mostrarCalificaciones, 
    crearCalificacion, 
    actualizarCalificacion, 
    eliminarCalificacion,
    obtenerCalificacion,
    obtenerPorTransporte,
    obtenerPorConductor,
    obtenerPorLugar,
    obtenerEstadisticas,
    obtenerRecientes
} = require('../controller/calificacion.controller');

// Obtener todas las calificaciones
router.get('/lista', mostrarCalificaciones);

// Obtener una calificación específica
router.get('/obtener/:id', obtenerCalificacion);

// Obtener calificaciones por transporte
router.get('/transporte/:transporteId', obtenerPorTransporte);

// Obtener calificaciones por conductor
router.get('/conductor/:conductorId', obtenerPorConductor);

// Obtener calificaciones por lugar turístico
router.get('/lugar/:lugarId', obtenerPorLugar);

// Obtener estadísticas de calificaciones
router.get('/estadisticas', obtenerEstadisticas);

// Obtener calificaciones recientes
router.get('/recientes', obtenerRecientes);

// Crear nueva calificación
router.post('/crear', crearCalificacion);

// Actualizar una calificación existente
router.put('/actualizar/:id', actualizarCalificacion);

// Eliminar (desactivar) una calificación
router.delete('/eliminar/:id', eliminarCalificacion);

module.exports = router;