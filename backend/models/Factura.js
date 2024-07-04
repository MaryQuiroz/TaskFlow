const mongoose = require('mongoose');

const facturaSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
    unique: true
  },
  cliente: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cliente',
    required: true
  },
  proyecto: {
    type: mongoose.Schema.ObjectId,
    ref: 'Proyecto',
    required: true
  },
  emisor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Usuario',
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'pagada', 'vencida', 'cancelada'],
    default: 'pendiente'
  },
  fechaEmision: {
    type: Date,
    default: Date.now,
    required: true
  },
  fechaVencimiento: {
    type: Date,
    required: true
  },
  items: [{
    descripcion: {
      type: String,
      required: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: [1, 'La cantidad debe ser al menos 1']
    },
    precioUnitario: {
      type: Number,
      required: true,
      min: [0, 'El precio unitario no puede ser negativo']
    },
    impuesto: {
      type: Number,
      default: 0
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  impuestos: {
    iva: {
      type: Number,
      default: 0
    },
    otros: {
      type: Number,
      default: 0
    }
  },
  total: {
    type: Number,
    required: true
  },
  moneda: {
    type: String,
    required: true,
    default: 'MXN'
  },
  metodoPago: {
    type: String,
    required: true,
    enum: ['transferencia', 'efectivo', 'cheque', 'otro']
  },
  notas: {
    type: String,
    maxlength: [500, 'Las notas no pueden tener más de 500 caracteres']
  },
  datosFacturacion: {
    rfc: String,
    razonSocial: String,
    direccion: {
      calle: String,
      ciudad: String,
      estado: String,
      codigoPostal: String,
      pais: String
    }
  },
  historialPagos: [{
    fecha: {
      type: Date,
      required: true
    },
    monto: {
      type: Number,
      required: true
    },
    metodoPago: {
      type: String,
      required: true
    },
    referencia: String,
    notas: String
  }],
  recordatoriosEnviados: [{
    fecha: Date,
    tipo: String,
    exitoso: Boolean
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
facturaSchema.index({ numero: 1 });
facturaSchema.index({ cliente: 1, fechaEmision: -1 });
facturaSchema.index({ estado: 1 });

// Virtual para calcular días vencidos
facturaSchema.virtual('diasVencidos').get(function() {
  if (this.estado === 'pagada' || this.estado === 'cancelada') return 0;
  
  const hoy = new Date();
  const vencimiento = new Date(this.fechaVencimiento);
  if (hoy <= vencimiento) return 0;
  
  const diferencia = hoy.getTime() - vencimiento.getTime();
  return Math.ceil(diferencia / (1000 * 3600 * 24));
});

// Virtual para calcular monto pendiente
facturaSchema.virtual('montoPendiente').get(function() {
  const pagosRealizados = this.historialPagos.reduce((total, pago) => total + pago.monto, 0);
  return this.total - pagosRealizados;
});

// Middleware para actualizar estado basado en fechas y pagos
facturaSchema.pre('save', function(next) {
  const hoy = new Date();
  
  if (this.montoPendiente <= 0) {
    this.estado = 'pagada';
  } else if (hoy > this.fechaVencimiento && this.estado === 'pendiente') {
    this.estado = 'vencida';
  }
  
  next();
});

// Método para generar número de factura
facturaSchema.statics.generarNumeroFactura = async function() {
  const ultimaFactura = await this.findOne().sort({ numero: -1 });
  const ultimoNumero = ultimaFactura ? parseInt(ultimaFactura.numero.slice(4)) : 0;
  const nuevoNumero = ultimoNumero + 1;
  return `FAC-${nuevoNumero.toString().padStart(6, '0')}`;
};

module.exports = mongoose.model('Factura', facturaSchema);
