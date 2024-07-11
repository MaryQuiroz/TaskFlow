const express = require('express');
const router = express.Router();
const {
  getFacturas,
  getFactura,
  crearFactura,
  updateFactura,
  registrarPago,
  enviarRecordatorio,
  getEstadisticasFacturacion
} = require('../controllers/facturaController');

const { protect, authorize, checkOwnership } = require('../middleware/auth');
const Factura = require('../models/Factura');

// Proteger todas las rutas
router.use(protect);

// Rutas CRUD básicas
router
  .route('/')
  .get(getFacturas)
  .post(authorize('admin', 'usuario'), crearFactura);

router
  .route('/:id')
  .get(checkOwnership(Factura), getFactura)
  .put(checkOwnership(Factura), updateFactura);

// Rutas para gestión de pagos y recordatorios
router
  .route('/:id/pagos')
  .post(checkOwnership(Factura), registrarPago);

router
  .route('/:id/recordatorio')
  .post(checkOwnership(Factura), enviarRecordatorio);

// Ruta para estadísticas
router
  .route('/estadisticas')
  .get(getEstadisticasFacturacion);

module.exports = router;
