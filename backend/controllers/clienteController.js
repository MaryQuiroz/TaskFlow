const Cliente = require('../models/Cliente');
const Proyecto = require('../models/Proyecto');
const Factura = require('../models/Factura');

// Obtener todos los clientes
exports.getClientes = async (req, res) => {
  try {
    // Verificar si el usuario está autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Construir query base
    const query = {
      usuario: req.user.id
    };

    // Si es admin, no filtrar por usuario
    if (req.user.rol === 'admin') {
      delete query.usuario;
    }

    // Ejecutar query con populate básico
    const clientes = await Cliente.find(query)
      .select('nombre email telefono empresa activo createdAt')
      .lean()
      .exec();

    // Obtener conteos relacionados para cada cliente
    const clientesConConteos = await Promise.all(clientes.map(async (cliente) => {
      const [proyectos, facturas] = await Promise.all([
        Proyecto.countDocuments({ cliente: cliente._id }),
        Factura.countDocuments({ cliente: cliente._id })
      ]);

      return {
        ...cliente,
        proyectosCount: proyectos,
        facturasCount: facturas
      };
    }));

    res.status(200).json({
      success: true,
      count: clientesConConteos.length,
      data: clientesConConteos
    });

  } catch (error) {
    console.error('Error en getClientes:', error);
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
    const cliente = await Cliente.findById(req.params.id)
      .populate([
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
    if (req.user && cliente.usuario && 
        cliente.usuario.toString() !== req.user.id && 
        req.user.rol !== 'admin') {
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
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Asignar usuario actual
    req.body.usuario = req.user.id;

    // Verificar campos requeridos
    if (!req.body.nombre || !req.body.email) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione nombre y email'
      });
    }

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
    console.error('Error al crear cliente:', error);
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
    if (req.user && cliente.usuario && 
        cliente.usuario.toString() !== req.user.id && 
        req.user.rol !== 'admin') {
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
    if (req.user && cliente.usuario && 
        cliente.usuario.toString() !== req.user.id && 
        req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para eliminar este cliente'
      });
    }

    // Verificar si tiene proyectos o facturas asociadas
    const [proyectosCount, facturasCount] = await Promise.all([
      Proyecto.countDocuments({ cliente: req.params.id }),
      Factura.countDocuments({ cliente: req.params.id })
    ]);

    if (proyectosCount > 0 || facturasCount > 0) {
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

    const [proyectos, facturas] = await Promise.all([
      Proyecto.find({ cliente: req.params.id }),
      Factura.find({ cliente: req.params.id })
    ]);

    const estadisticas = {
      totalProyectos: proyectos.length,
      proyectosActivos: proyectos.filter(p => p.estado === 'en_progreso').length,
      proyectosCompletados: proyectos.filter(p => p.estado === 'completado').length,
      totalFacturas: facturas.length,
      facturasPendientes: facturas.filter(f => f.estado === 'pendiente').length,
      facturasPagadas: facturas.filter(f => f.estado === 'pagada').length,
      montoTotalFacturado: facturas.reduce((total, f) => total + (f.total || 0), 0),
      montoPendiente: facturas
        .filter(f => f.estado === 'pendiente')
        .reduce((total, f) => total + (f.total || 0), 0)
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
