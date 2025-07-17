const express = require('express');
const router = express.Router();

const { obtenerPorRuta, crearTarifa, actualizarTarifa, eliminarTarifa } = require('../controller/tarifa.controller');

router.get('/ruta/:rutaId', obtenerPorRuta); // Obtener todas las tarifas
router.post('/crear', crearTarifa);
router.put('/actualizar/:id', actualizarTarifa);
router.delete('/eliminar/:id', eliminarTarifa);

module.exports = router;