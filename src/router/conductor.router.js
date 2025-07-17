const express = require('express');
const router = express.Router();
const { mostrarConductores, crearConductor, actualizarConductor, eliminarConductor } = require('../controller/conductor.controller');

router.get('/lista', mostrarConductores);
router.post('/crear', crearConductor);
router.put('/actualizar/:id', actualizarConductor);
router.delete('/eliminar/:id', eliminarConductor);

module.exports = router;