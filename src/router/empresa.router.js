const express = require('express');
const router = express.Router();

const { mostrarEmpresas, eliminarEmpresa, actualizarEmpresa, crearEmpresa } = require('../controller/empresaTransporte.controller');

router.get('/lista', mostrarEmpresas); // Obtener todas las empresas
router.post('/crear', crearEmpresa); // Crear nueva empresa
router.put('/actualizar/:id', actualizarEmpresa); // Actualizar empresa existente
router.delete('/eliminar/:id', eliminarEmpresa); // Eliminar (desactivar) empresa
module.exports = router;