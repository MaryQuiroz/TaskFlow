const Factura = require('../models/Factura');
const Proyecto = require('../models/Proyecto');
const Cliente = require('../models/Cliente');
const sendEmail = require('../utils/sendEmail');

// Obtener todas las facturas
exports.getFacturas = async (req, res) => {
  try {
    let query;

    // Copia de req.query
    const reqQuery = { ...req.query };

    // Campos a excluir
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Filtrar por usuario emisor si no es admin
    if (req.user.rol !== 'admin') {
      reqQuery.emisor = req.user.id;
    }

    // Crear query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Encontrar facturas
    query = Factura.find(JSON.parse(queryStr));

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
      query = query.sort('-fechaEmision');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Factura.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate
    query = query.populate([
      { path: 'cliente', select: 'nombre email empresa' },
      { path: 'proyecto', select: 'nombre' },
      { path: 'emisor', select: 'nombre email' }
    ]);

    // Ejecutar query
    const facturas = await query;

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
      count: facturas.length,
      pagination,
      data: facturas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener facturas',
      error: error.message
    });
  }
};

// Obtener una factura específica
exports.getFactura = async (req, res) => {
  try {
    const factura = await Factura.findById(req.params.id).populate([
      { path: 'cliente', select: 'nombre email empresa direccion' },
      { path: 'proyecto', select: 'nombre descripcion' },
      { path: 'emisor', select: 'nombre email' }
    ]);

    if (!factura) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Verificar autorización
    if (factura.emisor.toString() !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver esta factura'
      });
    }

    res.status(200).json({
      success: true,
      data: factura
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la factura',
      error: error.message
    });
  }
};

// Crear nueva factura
exports.crearFactura = async (req, res) => {
  try {
    // Verificar proyecto y cliente
    const proyecto = await Proyecto.findById(req.body.proyecto);
    if (!proyecto) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    const cliente = await Cliente.findById(req.body.cliente);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Asignar emisor
    req.body.emisor = req.user.id;

    // Generar número de factura
    req.body.numero = await Factura.generarNumeroFactura();

    // Calcular totales
    let subtotal = 0;
    req.body.items.forEach(item => {
      item.subtotal = item.cantidad * item.precioUnitario;
      subtotal += item.subtotal;
    });

    req.body.subtotal = subtotal;
    req.body.total = subtotal + (req.body.impuestos?.iva || 0) + (req.body.impuestos?.otros || 0);

    const factura = await Factura.create(req.body);

    // Enviar email al cliente
    try {
      await sendEmail({
        email: cliente.email,
        subject: `Nueva factura ${factura.numero}`,
        mensaje: `Se ha generado una nueva factura por un total de ${factura.total} ${factura.moneda}. Por favor, revise los detalles adjuntos.`
      });
    } catch (err) {
      console.log('Error al enviar email de factura:', err);
    }

    res.status(201).json({
      success: true,
      data: factura
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear la factura',
      error: error.message
    });
  }
};

// Actualizar factura
exports.updateFactura = async (req, res) => {
  try {
    let factura = await Factura.findById(req.params.id);

    if (!factura) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Verificar autorización
    if (factura.emisor.toString() !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para actualizar esta factura'
      });
    }

    // No permitir modificar número de factura
    if (req.body.numero) {
      delete req.body.numero;
    }

    // Recalcular totales si se modifican items
    if (req.body.items) {
      let subtotal = 0;
      req.body.items.forEach(item => {
        item.subtotal = item.cantidad * item.precioUnitario;
        subtotal += item.subtotal;
      });

      req.body.subtotal = subtotal;
      req.body.total = subtotal + (req.body.impuestos?.iva || 0) + (req.body.impuestos?.otros || 0);
    }

    factura = await Factura.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: factura
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar la factura',
      error: error.message
    });
  }
};

// Registrar pago
exports.registrarPago = async (req, res) => {
  try {
    const factura = await Factura.findById(req.params.id);

    if (!factura) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Verificar autorización
    if (factura.emisor.toString() !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para registrar pagos en esta factura'
      });
    }

    // Agregar pago al historial
    factura.historialPagos.push({
      fecha: new Date(),
      monto: req.body.monto,
      metodoPago: req.body.metodoPago,
      referencia: req.body.referencia,
      notas: req.body.notas
    });

    // Actualizar estado si el pago completa el total
    if (factura.montoPendiente <= 0) {
      factura.estado = 'pagada';
    }

    await factura.save();

    res.status(200).json({
      success: true,
      data: factura
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al registrar el pago',
      error: error.message
    });
  }
};

// Enviar recordatorio
exports.enviarRecordatorio = async (req, res) => {
  try {
    const factura = await Factura.findById(req.params.id).populate({
      path: 'cliente',
      select: 'email nombre'
    });

    if (!factura) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    if (factura.estado !== 'pendiente' && factura.estado !== 'vencida') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden enviar recordatorios de facturas pendientes o vencidas'
      });
    }

    // Enviar email de recordatorio
    await sendEmail({
      email: factura.cliente.email,
      subject: `Recordatorio de pago - Factura ${factura.numero}`,
      mensaje: `Estimado ${factura.cliente.nombre},\n\nLe recordamos que tiene pendiente el pago de la factura ${factura.numero} por un monto de ${factura.total} ${factura.moneda}.\n\nPor favor, realice el pago lo antes posible.`
    });

    // Registrar recordatorio
    factura.recordatoriosEnviados.push({
      fecha: new Date(),
      tipo: 'email',
      exitoso: true
    });

    await factura.save();

    res.status(200).json({
      success: true,
      message: 'Recordatorio enviado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al enviar recordatorio',
      error: error.message
    });
  }
};

// Obtener estadísticas de facturación
exports.getEstadisticasFacturacion = async (req, res) => {
  try {
    // Construir el query base
    const query = req.user.rol !== 'admin' ? { emisor: req.user.id } : {};

    // Obtener el mes actual
    const now = new Date();
    const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const ultimoDiaMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Agregar filtro de fecha para el mes actual
    const queryMesActual = {
      ...query,
      fechaEmision: {
        $gte: primerDiaMes,
        $lte: ultimoDiaMes
      }
    };

    // Obtener todas las facturas y las del mes actual
    const [todasFacturas, facturasMesActual] = await Promise.all([
      Factura.find(query),
      Factura.find(queryMesActual)
    ]);

    // Calcular estadísticas
    const estadisticas = {
      totalFacturas: todasFacturas.length,
      facturasPendientes: todasFacturas.filter(f => f.estado === 'pendiente').length,
      facturasVencidas: todasFacturas.filter(f => f.estado === 'vencida').length,
      facturasPagadas: todasFacturas.filter(f => f.estado === 'pagada').length,
      montoTotalFacturado: todasFacturas.reduce((total, f) => total + f.total, 0),
      montoFacturadoMesActual: facturasMesActual.reduce((total, f) => total + f.total, 0),
      montoPendiente: todasFacturas
        .filter(f => f.estado === 'pendiente' || f.estado === 'vencida')
        .reduce((total, f) => total + f.montoPendiente, 0),
      montoCobrado: todasFacturas
        .reduce((total, f) => total + (f.total - f.montoPendiente), 0),
      montoCobradoMesActual: facturasMesActual
        .reduce((total, f) => total + (f.total - f.montoPendiente), 0)
    };

    res.status(200).json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de facturación',
      error: error.message
    });
  }
};
