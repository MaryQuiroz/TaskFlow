const express = require('express');
const router = express.Router();
const {
  getClientes,
  getCliente,
  crearCliente,
  updateCliente,
  deleteCliente,
  getEstadisticasCliente
} = require('../controllers/clienteController');

const { protect, authorize, checkOwnership } = require('../middleware/auth');
const Cliente = require('../models/Cliente');

// Proteger todas las rutas
router.use(protect);

// Rutas CRUD básicas
router
  .route('/')
  .get(getClientes)
  .post(authorize('admin', 'usuario'), crearCliente);

router
  .route('/:id')
  .get(checkOwnership(Cliente), getCliente)
  .put(checkOwnership(Cliente), updateCliente)
  .delete(checkOwnership(Cliente), deleteCliente);

// Ruta para estadísticas
router
  .route('/:id/estadisticas')
  .get(checkOwnership(Cliente), getEstadisticasCliente);

module.exports = router;
