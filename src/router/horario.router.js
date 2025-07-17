const express = require('express');
const router = express.Router();

const{ obtenerPorRuta, crearHorario, actualizarHorario, eliminarHorario } = require('../controller/horario.controller');

router.get('/lista/:rutaId', obtenerPorRuta); // Obtener horarios por ruta
router.post('/crear', crearHorario); // Crear nuevo horario
router.put('/actualizar/:id', actualizarHorario); // Actualizar horario existente
router.delete('/eliminar/:id', eliminarHorario); // Eliminar horario

module.exports = router;