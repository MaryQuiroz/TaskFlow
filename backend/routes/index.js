const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');
const proyectosRoutes = require('./proyectos');
const clientesRoutes = require('./clientes');
const facturasRoutes = require('./facturas');

// Montar rutas
router.use('/auth', authRoutes);
router.use('/proyectos', proyectosRoutes);
router.use('/clientes', clientesRoutes);
router.use('/facturas', facturasRoutes);

module.exports = router;
