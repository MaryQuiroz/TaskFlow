const Factura = require('../models/Factura');

// @desc    Obtener todas las facturas
// @route   GET /api/v1/facturas
// @access  Private
exports.getFacturas = async (req, res) => {
  try {
    const facturas = await Factura.find({ emisor: req.user.id })
      .populate('cliente')
      .populate('proyecto')
      .sort({ fechaEmision: -1 });
    
    res.status(200).json({
      success: true,
      data: facturas
    });
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las facturas'
    });
  }
};

// @desc    Obtener una factura
// @route   GET /api/v1/facturas/:id
// @access  Private
exports.getFactura = async (req, res) => {
  try {
    const factura = await Factura.findById(req.params.id)
      .populate('cliente')
      .populate('proyecto');
    
    if (!factura) {
      return res.status(404).json({
        success: false,
        error: 'Factura no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: factura
    });
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la factura'
    });
  }
};

// @desc    Crear nueva factura
// @route   POST /api/v1/facturas
// @access  Private
exports.crearFactura = async (req, res) => {
  try {
    // Generar número de factura
    const ultimaFactura = await Factura.findOne().sort({ numero: -1 });
    const ultimoNumero = ultimaFactura ? parseInt(ultimaFactura.numero.slice(4)) : 0;
    const nuevoNumero = `FAC-${(ultimoNumero + 1).toString().padStart(6, '0')}`;

    // Calcular subtotal y total
    const items = req.body.items.map(item => ({
      ...item,
      subtotal: item.cantidad * item.precioUnitario
    }));

    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    // Crear objeto de factura
    const facturaData = {
      numero: nuevoNumero,
      cliente: req.body.cliente,
      proyecto: req.body.proyecto,
      emisor: req.user.id,
      estado: 'pendiente',
      fechaEmision: req.body.fechaEmision || new Date(),
      fechaVencimiento: req.body.fechaVencimiento,
      items: items,
      subtotal: subtotal,
      impuestos: {
        iva: iva,
        otros: req.body.impuestos?.otros || 0
      },
      total: total,
      moneda: req.body.moneda || 'MXN',
      metodoPago: req.body.metodoPago || 'transferencia',
      notas: req.body.notas,
      datosFacturacion: req.body.datosFacturacion
    };

    const factura = await Factura.create(facturaData);
    
    // Poblar referencias para la respuesta
    await factura.populate(['cliente', 'proyecto']);

    res.status(201).json({
      success: true,
      data: factura
    });
  } catch (error) {
    console.error('Error al crear factura:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear la factura',
      details: error.message
    });
  }
};

// @desc    Actualizar factura
// @route   PUT /api/v1/facturas/:id
// @access  Private
exports.updateFactura = async (req, res) => {
  try {
    let factura = await Factura.findById(req.params.id);

    if (!factura) {
      return res.status(404).json({
        success: false,
        error: 'Factura no encontrada'
      });
    }

    // Verificar propiedad
    if (factura.emisor.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado para actualizar esta factura'
      });
    }

    // Si se actualizan los items, recalcular totales
    if (req.body.items) {
      const items = req.body.items.map(item => ({
        ...item,
        subtotal: item.cantidad * item.precioUnitario
      }));

      const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
      const iva = subtotal * 0.16;
      const total = subtotal + iva;

      req.body.items = items;
      req.body.subtotal = subtotal;
      req.body.impuestos = {
        ...req.body.impuestos,
        iva: iva
      };
      req.body.total = total;
    }

    factura = await Factura.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate(['cliente', 'proyecto']);

    res.status(200).json({
      success: true,
      data: factura
    });
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar la factura'
    });
  }
};

// @desc    Registrar pago de factura
// @route   POST /api/v1/facturas/:id/pagos
// @access  Private
exports.registrarPago = async (req, res) => {
  try {
    const factura = await Factura.findById(req.params.id);

    if (!factura) {
      return res.status(404).json({
        success: false,
        error: 'Factura no encontrada'
      });
    }

    // Verificar propiedad
    if (factura.emisor.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado para registrar pagos en esta factura'
      });
    }

    const pago = {
      fecha: new Date(),
      monto: req.body.monto,
      metodoPago: req.body.metodoPago,
      referencia: req.body.referencia,
      notas: req.body.notas
    };

    factura.historialPagos.push(pago);
    factura.estado = 'pagada';
    await factura.save();

    res.status(200).json({
      success: true,
      data: factura
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar el pago'
    });
  }
};

// @desc    Enviar recordatorio de pago
// @route   POST /api/v1/facturas/:id/recordatorio
// @access  Private
exports.enviarRecordatorio = async (req, res) => {
  try {
    const factura = await Factura.findById(req.params.id);

    if (!factura) {
      return res.status(404).json({
        success: false,
        error: 'Factura no encontrada'
      });
    }

    // Verificar propiedad
    if (factura.emisor.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado para enviar recordatorios de esta factura'
      });
    }

    const recordatorio = {
      fecha: new Date(),
      tipo: 'email',
      exitoso: true
    };

    factura.recordatoriosEnviados.push(recordatorio);
    await factura.save();
    
    res.status(200).json({
      success: true,
      message: 'Recordatorio enviado exitosamente'
    });
  } catch (error) {
    console.error('Error al enviar recordatorio:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar el recordatorio'
    });
  }
};

// @desc    Obtener estadísticas de facturación
// @route   GET /api/v1/facturas/estadisticas
// @access  Private
exports.getEstadisticasFacturacion = async (req, res) => {
  try {
    const stats = await Factura.aggregate([
      {
        $match: { emisor: req.user._id }
      },
      {
        $group: {
          _id: null,
          totalFacturado: { $sum: '$total' },
          totalPagado: {
            $sum: {
              $cond: [{ $eq: ['$estado', 'pagada'] }, '$total', 0]
            }
          },
          totalPendiente: {
            $sum: {
              $cond: [{ $eq: ['$estado', 'pendiente'] }, '$total', 0]
            }
          },
          cantidadFacturas: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalFacturado: 0,
        totalPagado: 0,
        totalPendiente: 0,
        cantidadFacturas: 0
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las estadísticas'
    });
  }
};
