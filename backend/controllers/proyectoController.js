const Proyecto = require('../models/Proyecto');
const Cliente = require('../models/Cliente');

// Obtener todos los proyectos
exports.getProyectos = async (req, res) => {
  try {
    let query;

    // Copia de req.query
    const reqQuery = { ...req.query };

    // Campos a excluir
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Crear query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Encontrar proyectos
    query = Proyecto.find(JSON.parse(queryStr));

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Proyecto.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Populate
    query = query.populate([
      { path: 'cliente', select: 'nombre email empresa' },
      { path: 'responsable', select: 'nombre email' },
      { path: 'equipo', select: 'nombre email' }
    ]);

    // Ejecutar query
    const proyectos = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: proyectos.length,
      pagination,
      data: proyectos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener proyectos',
      error: error.message
    });
  }
};

// Obtener un proyecto específico
exports.getProyecto = async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id).populate([
      { path: 'cliente', select: 'nombre email empresa' },
      { path: 'responsable', select: 'nombre email' },
      { path: 'equipo', select: 'nombre email' }
    ]);

    if (!proyecto) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: proyecto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el proyecto',
      error: error.message
    });
  }
};

// Crear nuevo proyecto
exports.crearProyecto = async (req, res) => {
  try {
    // Verificar si el cliente existe
    const cliente = await Cliente.findById(req.body.cliente);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Asignar el usuario actual como responsable si no se especifica
    if (!req.body.responsable) {
      req.body.responsable = req.user.id;
    }

    const proyecto = await Proyecto.create(req.body);

    res.status(201).json({
      success: true,
      data: proyecto
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear el proyecto',
      error: error.message
    });
  }
};

// Actualizar proyecto
exports.updateProyecto = async (req, res) => {
  try {
    let proyecto = await Proyecto.findById(req.params.id);

    if (!proyecto) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Verificar propiedad del proyecto
    if (proyecto.responsable.toString() !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para actualizar este proyecto'
      });
    }

    proyecto = await Proyecto.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: proyecto
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar el proyecto',
      error: error.message
    });
  }
};

// Eliminar proyecto
exports.deleteProyecto = async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id);

    if (!proyecto) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Verificar propiedad del proyecto
    if (proyecto.responsable.toString() !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para eliminar este proyecto'
      });
    }

    await proyecto.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al eliminar el proyecto',
      error: error.message
    });
  }
};

// Gestión de tareas
exports.addTarea = async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id);

    if (!proyecto) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    proyecto.tareas.push(req.body);
    await proyecto.save();

    res.status(200).json({
      success: true,
      data: proyecto
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al añadir tarea',
      error: error.message
    });
  }
};

exports.updateTarea = async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id);

    if (!proyecto) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    const tarea = proyecto.tareas.id(req.params.tareaId);

    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    Object.assign(tarea, req.body);
    await proyecto.save();

    res.status(200).json({
      success: true,
      data: proyecto
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar tarea',
      error: error.message
    });
  }
};

exports.deleteTarea = async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id);

    if (!proyecto) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    proyecto.tareas.id(req.params.tareaId).remove();
    await proyecto.save();

    res.status(200).json({
      success: true,
      data: proyecto
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al eliminar tarea',
      error: error.message
    });
  }
};
