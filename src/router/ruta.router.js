const express = require('express');
const router = express.Router();

const { 
    mostrarRutas, 
    crearRuta, 
    actualizarRuta, 
    eliminarRuta,
    obtenerRuta,
    buscarPorEstacion
} = require('../controller/ruta.controller');

// Obtener todas las rutas
router.get('/lista', mostrarRutas);

// Obtener una ruta específica
router.get('/obtener/:id', obtenerRuta);

// Buscar rutas que pasen por una estación
router.get('/por-estacion/:idEstacion', buscarPorEstacion);

// Crear nueva ruta
router.post('/crear', crearRuta);

// Actualizar una ruta existente
router.put('/actualizar/:id', actualizarRuta);

// Eliminar (desactivar) una ruta
router.delete('/eliminar/:id', eliminarRuta);

module.exports = router;