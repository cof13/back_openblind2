const express = require('express');
const router = express.Router();

const { 
    mostrarTransportes, 
    crearTransporte, 
    actualizarTransporte, 
    eliminarTransporte,
    obtenerTransporte
} = require('../controller/transporte.controller');

// Obtener todos los transportes
router.get('/lista', mostrarTransportes);

// Obtener un transporte específico
router.get('/obtener/:id', obtenerTransporte);

// Crear nuevo transporte
router.post('/crear', crearTransporte);

// Actualizar un transporte existente
router.put('/actualizar/:id', actualizarTransporte);

// Eliminar (desactivar) un transporte
router.delete('/eliminar/:id', eliminarTransporte);

module.exports = router;