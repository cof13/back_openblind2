const express = require('express');
const router = express.Router();

const {dashboard, reporteCalificaciones, reporteUsuarios} = require('../controller/reporte.controller');

router.get('/dashboard', dashboard);
router.get('/calificaciones', reporteCalificaciones);
router.get('/usuarios', reporteUsuarios);

module.exports = router;
