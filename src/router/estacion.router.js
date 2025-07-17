const express = require('express');
const router = express.Router();

const { 
    mostrarEstaciones, 
    crearEstacion, 
    actualizarEstacion, 
    eliminarEstacion,
    obtenerEstacion,
    buscarPorUbicacion
} = require('../controller/estacion.controller');

// Obtener todas las estaciones
router.get('/lista', mostrarEstaciones);

// Obtener una estación específica
router.get('/obtener/:id', obtenerEstacion);

// Buscar estaciones por ubicación
router.get('/buscar-ubicacion', buscarPorUbicacion);

// Crear nueva estación
router.post('/crear', crearEstacion);

// Actualizar una estación existente
router.put('/actualizar/:id', actualizarEstacion);

// Eliminar (desactivar) una estación
router.delete('/eliminar/:id', eliminarEstacion);

module.exports = router;