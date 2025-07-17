const express = require('express');
const router = express.Router();

const { 
    mostrarLugares, 
    crearLugar, 
    actualizarLugar, 
    eliminarLugar,
    obtenerLugar,
    buscarPorCategoria,
    buscarPorUbicacion,
    agregarResena
} = require('../controller/lugarTuristico.controller');

// Obtener todos los lugares turísticos
router.get('/lista', mostrarLugares);

// Obtener un lugar específico
router.get('/obtener/:id', obtenerLugar);

// Buscar lugares por categoría
router.get('/categoria/:idCategoria', buscarPorCategoria);

// Buscar lugares por ubicación
router.get('/buscar-ubicacion', buscarPorUbicacion);

// Crear nuevo lugar turístico
router.post('/crear', crearLugar);

// Agregar reseña a un lugar
router.post('/resena/:id', agregarResena);

// Actualizar un lugar turístico existente
router.put('/actualizar/:id', actualizarLugar);

// Eliminar (desactivar) un lugar turístico
router.delete('/eliminar/:id', eliminarLugar);

module.exports = router;