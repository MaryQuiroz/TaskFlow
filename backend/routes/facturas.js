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

const { protect } = require('../middleware/auth');
const Factura = require('../models/Factura');

// Proteger todas las rutas
router.use(protect);

// Ruta para estadísticas (debe ir antes de las rutas con :id)
router.get('/estadisticas', getEstadisticasFacturacion);

// Rutas CRUD básicas
router
  .route('/')
  .get(getFacturas)
  .post(crearFactura);

router
  .route('/:id')
  .get(getFactura)
  .put(updateFactura);

// Ruta para generar PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const factura = await Factura.findById(req.params.id)
      .populate('cliente')
      .populate('proyecto');

    if (!factura) {
      return res.status(404).json({
        success: false,
        error: 'Factura no encontrada'
      });
    }

    if (factura.emisor.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }
    
    const doc = new PDFDocument();
    
    // Configurar respuesta HTTP
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=factura-${factura.numero}.pdf`);
    
    doc.pipe(res);

    // Diseño del PDF
    doc.fontSize(25).text('FACTURA', { align: 'center' });
    doc.moveDown();
    
    // Información de la factura
    doc.fontSize(12);
    doc.text(`Número de Factura: ${factura.numero}`);
    doc.text(`Fecha de Emisión: ${new Date(factura.fechaEmision).toLocaleDateString()}`);
    doc.text(`Fecha de Vencimiento: ${new Date(factura.fechaVencimiento).toLocaleDateString()}`);
    doc.moveDown();
    
    // Información del cliente
    if (factura.cliente) {
      doc.text('CLIENTE:', { underline: true });
      doc.text(`Nombre: ${factura.cliente.nombre}`);
      doc.text(`Email: ${factura.cliente.email}`);
      doc.moveDown();
    }

    // Información del proyecto
    if (factura.proyecto) {
      doc.text('PROYECTO:', { underline: true });
      doc.text(`Nombre: ${factura.proyecto.nombre}`);
      doc.moveDown();
    }
    
    // Items
    doc.text('ITEMS:', { underline: true });
    doc.moveDown();
    
    // Tabla de items
    let y = doc.y;
    doc.text('Descripción', 50, y);
    doc.text('Cantidad', 300, y);
    doc.text('Precio', 400, y);
    doc.text('Total', 500, y);
    
    y += 20;
    if (factura.items && Array.isArray(factura.items)) {
      factura.items.forEach(item => {
        doc.text(item.descripcion || '', 50, y);
        doc.text(item.cantidad?.toString() || '0', 300, y);
        doc.text(`$${item.precioUnitario?.toFixed(2) || '0.00'}`, 400, y);
        doc.text(`$${(item.subtotal || 0).toFixed(2)}`, 500, y);
        y += 20;
      });
    }
    
    doc.moveDown();
    doc.moveDown();
    
    // Totales
    const startY = y + 20;
    doc.text('Subtotal:', 400, startY);
    doc.text(`$${factura.subtotal.toFixed(2)}`, 500, startY);
    
    doc.text('IVA (16%):', 400, startY + 20);
    doc.text(`$${factura.impuestos.iva.toFixed(2)}`, 500, startY + 20);
    
    if (factura.impuestos.otros > 0) {
      doc.text('Otros Impuestos:', 400, startY + 40);
      doc.text(`$${factura.impuestos.otros.toFixed(2)}`, 500, startY + 40);
    }
    
    doc.text('Total:', 400, startY + 60, { bold: true });
    doc.text(`$${factura.total.toFixed(2)}`, 500, startY + 60, { bold: true });

    // Información adicional
    doc.moveDown();
    doc.moveDown();
    doc.text(`Método de Pago: ${factura.metodoPago}`);
    doc.text(`Moneda: ${factura.moneda}`);

    if (factura.notas) {
      doc.moveDown();
      doc.text('Notas:', { underline: true });
      doc.text(factura.notas);
    }
    
    // Finalizar PDF
    doc.end();
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar el PDF'
    });
  }
});

// Rutas para gestión de pagos y recordatorios
router
  .route('/:id/pagos')
  .post(registrarPago);

router
  .route('/:id/recordatorio')
  .post(enviarRecordatorio);

module.exports = router;
