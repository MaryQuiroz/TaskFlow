const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Por favor ingrese el nombre del cliente'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Por favor ingrese el email del cliente'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingrese un email válido'
    ]
  },
  telefono: {
    type: String,
    maxlength: [20, 'El número de teléfono no puede tener más de 20 caracteres']
  },
  empresa: {
    type: String,
    trim: true
  },
  direccion: {
    calle: String,
    ciudad: String,
    estado: String,
    codigoPostal: String,
    pais: String
  },
  rfc: {
    type: String,
    trim: true
  },
  notas: {
    type: String,
    maxlength: [500, 'Las notas no pueden tener más de 500 caracteres']
  },
  datosFacturacion: {
    metodoPago: {
      type: String,
      enum: ['transferencia', 'efectivo', 'cheque', 'otro'],
      default: 'transferencia'
    },
    datosBancarios: {
      banco: String,
      numeroCuenta: String,
      clabe: String
    }
  },
  activo: {
    type: Boolean,
    default: true
  },
  usuario: {
    type: mongoose.Schema.ObjectId,
    ref: 'Usuario',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para obtener todos los proyectos del cliente
clienteSchema.virtual('proyectos', {
  ref: 'Proyecto',
  localField: '_id',
  foreignField: 'cliente',
  justOne: false
});

// Virtual para obtener todas las facturas del cliente
clienteSchema.virtual('facturas', {
  ref: 'Factura',
  localField: '_id',
  foreignField: 'cliente',
  justOne: false
});

// Índices
clienteSchema.index({ usuario: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Cliente', clienteSchema);
