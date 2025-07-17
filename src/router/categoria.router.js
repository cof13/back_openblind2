const express = require('express');
const router = express.Router();

const { 
    // Categorías de Transporte
    mostrarcategoriasTransportes,
    crearCategoriaTransporte,
    actualizarCategoriaTransporte,
    eliminarCategoriaTransporte,
    validarCategoriaTransporte,
    
    // Categorías de Estación
    mostrarcategoriasEstacions,
    crearCategoriaEstacion,
    actualizarCategoriaEstacion,
    eliminarCategoriaEstacion,
    validarCategoriaEstacion,
    
    // Categorías de Lugar Turístico
    mostrarcategoriasLugars,
    crearCategoriaLugar,
    actualizarCategoriaLugar,
    eliminarCategoriaLugar,
    validarCategoriaLugar,
    
    // Tipos de Mensaje
    mostrartiposMensajes,
    crearTipoMensaje,
    
    // Métodos de Ingreso
    mostrarmetodosIngresos,
    crearMetodoIngreso,
    
    // Idiomas
    mostrarIdiomas,
    crearIdioma,
    
    // Funciones Generales
    obtenerTodasLasCategorias,
    buscarCategorias,
    obtenerEstadisticas,
    crearCategoriasPorDefecto
} = require('../controller/categoria.controller');

// ================ RUTAS DE CATEGORÍAS DE TRANSPORTE ================
// Obtener todas las categorías de transporte
router.get('/transporte/lista', mostrarcategoriasTransportes);

// Validar categoría de transporte
router.get('/transporte/validar/:id', validarCategoriaTransporte);

// Crear nueva categoría de transporte
router.post('/transporte/crear', crearCategoriaTransporte);

// Actualizar categoría de transporte
router.put('/transporte/actualizar/:id', actualizarCategoriaTransporte);

// Eliminar categoría de transporte
router.delete('/transporte/eliminar/:id', eliminarCategoriaTransporte);

// ================ RUTAS DE CATEGORÍAS DE ESTACIÓN ================
// Obtener todas las categorías de estación
router.get('/estacion/lista', mostrarcategoriasEstacions);

// Validar categoría de estación
router.get('/estacion/validar/:id', validarCategoriaEstacion);

// Crear nueva categoría de estación
router.post('/estacion/crear', crearCategoriaEstacion);

// Actualizar categoría de estación
router.put('/estacion/actualizar/:id', actualizarCategoriaEstacion);

// Eliminar categoría de estación
router.delete('/estacion/eliminar/:id', eliminarCategoriaEstacion);

// ================ RUTAS DE CATEGORÍAS DE LUGAR TURÍSTICO ================
// Obtener todas las categorías de lugar turístico
router.get('/lugar/lista', mostrarcategoriasLugars);

// Validar categoría de lugar turístico
router.get('/lugar/validar/:id', validarCategoriaLugar);

// Crear nueva categoría de lugar turístico
router.post('/lugar/crear', crearCategoriaLugar);

// Actualizar categoría de lugar turístico
router.put('/lugar/actualizar/:id', actualizarCategoriaLugar);

// Eliminar categoría de lugar turístico
router.delete('/lugar/eliminar/:id', eliminarCategoriaLugar);

// ================ RUTAS DE TIPOS DE MENSAJE ================
// Obtener todos los tipos de mensaje
router.get('/tipos-mensaje/lista', mostrartiposMensajes);

// Crear nuevo tipo de mensaje
router.post('/tipos-mensaje/crear', crearTipoMensaje);

// ================ RUTAS DE MÉTODOS DE INGRESO ================
// Obtener todos los métodos de ingreso
router.get('/metodos-ingreso/lista', mostrarmetodosIngresos);

// Crear nuevo método de ingreso
router.post('/metodos-ingreso/crear', crearMetodoIngreso);

// ================ RUTAS DE IDIOMAS ================
// Obtener todos los idiomas
router.get('/idiomas/lista', mostrarIdiomas);

// Crear nuevo idioma
router.post('/idiomas/crear', crearIdioma);

// ================ RUTAS GENERALES ================
// Obtener resumen de todas las categorías
router.get('/todas', obtenerTodasLasCategorias);

// Buscar categorías por nombre
router.get('/buscar', buscarCategorias);

// Obtener estadísticas de categorías
router.get('/estadisticas', obtenerEstadisticas);

// Crear categorías por defecto del sistema
router.post('/por-defecto', crearCategoriasPorDefecto);

module.exports = router;