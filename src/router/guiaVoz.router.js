const express = require('express');
const router = express.Router();

const { 
    mostrarGuias, 
    crearGuia, 
    actualizarGuia, 
    eliminarGuia,
    obtenerGuia,
    obtenerPorLugar,
    obtenerPorIdioma,
    registrarReproduccion,
    registrarDescarga,
    buscarPorCategoria
} = require('../controller/guiaVoz.controller');

// Obtener todas las guías de voz
router.get('/lista', mostrarGuias);

// Obtener una guía específica
router.get('/obtener/:id', obtenerGuia);

// Obtener guías por lugar turístico
router.get('/lugar/:lugarId', obtenerPorLugar);

// Obtener guías por idioma
router.get('/idioma/:idiomaId', obtenerPorIdioma);

// Buscar guías por categoría
router.get('/categoria/:categoria', buscarPorCategoria);

// Crear nueva guía de voz
router.post('/crear', crearGuia);

// Registrar reproducción de guía
router.post('/reproduccion/:id', registrarReproduccion);

// Registrar descarga de guía
router.post('/descarga/:id', registrarDescarga);

// Actualizar una guía de voz existente
router.put('/actualizar/:id', actualizarGuia);

// Eliminar (desactivar) una guía de voz
router.delete('/eliminar/:id', eliminarGuia);

module.exports = router;