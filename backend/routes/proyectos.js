const express = require('express');
const router = express.Router();
const {
  getProyectos,
  getProyecto,
  crearProyecto,
  updateProyecto,
  deleteProyecto,
  addTarea,
  updateTarea,
  deleteTarea
} = require('../controllers/proyectoController');

const { protect, authorize, checkOwnership } = require('../middleware/auth');
const Proyecto = require('../models/Proyecto');

// Proteger todas las rutas
router.use(protect);

// Rutas CRUD básicas
router
  .route('/')
  .get(getProyectos)
  .post(authorize('admin', 'usuario'), crearProyecto);

router
  .route('/:id')
  .get(checkOwnership(Proyecto), getProyecto)
  .put(checkOwnership(Proyecto), updateProyecto)
  .delete(checkOwnership(Proyecto), deleteProyecto);

// Rutas para gestión de tareas
router
  .route('/:id/tareas')
  .post(checkOwnership(Proyecto), addTarea);

router
  .route('/:id/tareas/:tareaId')
  .put(checkOwnership(Proyecto), updateTarea)
  .delete(checkOwnership(Proyecto), deleteTarea);

module.exports = router;
