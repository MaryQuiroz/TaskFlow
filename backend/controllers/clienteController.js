const Cliente = require('../models/Cliente');
const Proyecto = require('../models/Proyecto');
const Factura = require('../models/Factura');

// Obtener todos los clientes
exports.getClientes = async (req, res) => {
  try {
    let query;

    // Copia de req.query
    const reqQuery = { ...req.query };

    // Campos a excluir
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Filtrar por usuario actual si no es admin
    if (req.user.rol !== 'admin') {
      reqQuery.usuario = req.user.id;
    }

    // Crear query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Encontrar clientes
    query = Cliente.find(JSON.parse(queryStr));

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
    const total = await Cliente.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate con proyectos y facturas
    query = query.populate([
      { 
        path: 'proyectos',
        select: 'nombre estado fechaInicio fechaFinalizacion'
      },
      {
        path: 'facturas',
        select: 'numero estado total fechaEmision fechaVencimiento'
      }
    ]);

    // Ejecutar query
    const clientes = await query;

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
      count: clientes.length,
      pagination,
      data: clientes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes',
      error: error.message
    });
  }
};

// Obtener un cliente específico
exports.getCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).populate([
      {
        path: 'proyectos',
        select: 'nombre estado fechaInicio fechaFinalizacion presupuesto'
      },
      {
        path: 'facturas',
        select: 'numero estado total fechaEmision fechaVencimiento'
      }
    ]);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Verificar propiedad del cliente
    if (cliente.usuario.toString() !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver este cliente'
      });
    }

    res.status(200).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el cliente',
      error: error.message
    });
  }
};

// Crear nuevo cliente
exports.crearCliente = async (req, res) => {
  try {
    // Asignar usuario actual
    req.body.usuario = req.user.id;

    // Verificar si ya existe un cliente con el mismo email para este usuario
    const clienteExistente = await Cliente.findOne({
      email: req.body.email,
      usuario: req.user.id
    });

    if (clienteExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un cliente con este email'
      });
    }

    const cliente = await Cliente.create(req.body);

    res.status(201).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear el cliente',
      error: error.message
    });
  }
};

// Actualizar cliente
exports.updateCliente = async (req, res) => {
  try {
    let cliente = await Cliente.findById(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Verificar propiedad del cliente
    if (cliente.usuario.toString() !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para actualizar este cliente'
      });
    }

    cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar el cliente',
      error: error.message
    });
  }
};

// Eliminar cliente
exports.deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Verificar propiedad del cliente
    if (cliente.usuario.toString() !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para eliminar este cliente'
      });
    }

    // Verificar si tiene proyectos o facturas asociadas
    const proyectosAsociados = await Proyecto.countDocuments({ cliente: req.params.id });
    const facturasAsociadas = await Factura.countDocuments({ cliente: req.params.id });

    if (proyectosAsociados > 0 || facturasAsociadas > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el cliente porque tiene proyectos o facturas asociadas'
      });
    }

    await cliente.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al eliminar el cliente',
      error: error.message
    });
  }
};

// Obtener estadísticas del cliente
exports.getEstadisticasCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Obtener proyectos
    const proyectos = await Proyecto.find({ cliente: req.params.id });
    const facturas = await Factura.find({ cliente: req.params.id });

    // Calcular estadísticas
    const estadisticas = {
      totalProyectos: proyectos.length,
      proyectosActivos: proyectos.filter(p => p.estado === 'en_progreso').length,
      proyectosCompletados: proyectos.filter(p => p.estado === 'completado').length,
      totalFacturas: facturas.length,
      facturasPendientes: facturas.filter(f => f.estado === 'pendiente').length,
      facturasPagadas: facturas.filter(f => f.estado === 'pagada').length,
      montoTotalFacturado: facturas.reduce((total, f) => total + f.total, 0),
      montoPendiente: facturas
        .filter(f => f.estado === 'pendiente')
        .reduce((total, f) => total + f.total, 0)
    };

    res.status(200).json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del cliente',
      error: error.message
    });
  }
};
