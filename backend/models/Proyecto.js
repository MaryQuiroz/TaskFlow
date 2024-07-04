const mongoose = require('mongoose');

const tareaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'Por favor ingrese el título de la tarea'],
    trim: true,
    maxlength: [100, 'El título no puede tener más de 100 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'Por favor ingrese la descripción de la tarea'],
    maxlength: [500, 'La descripción no puede tener más de 500 caracteres']
  },
  estado: {
    type: String,
    enum: ['pendiente', 'en_progreso', 'revision', 'completada'],
    default: 'pendiente'
  },
  prioridad: {
    type: String,
    enum: ['baja', 'media', 'alta'],
    default: 'media'
  },
  fechaVencimiento: {
    type: Date
  },
  asignadoA: {
    type: mongoose.Schema.ObjectId,
    ref: 'Usuario'
  },
  completadoPor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Usuario'
  },
  fechaCompletado: Date,
  etiquetas: [String],
  archivos: [{
    nombre: String,
    url: String,
    tipo: String
  }]
}, {
  timestamps: true
});

const proyectoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Por favor ingrese el nombre del proyecto'],
    trim: true,
    maxlength: [200, 'El nombre no puede tener más de 200 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'Por favor ingrese la descripción del proyecto'],
    maxlength: [1000, 'La descripción no puede tener más de 1000 caracteres']
  },
  cliente: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cliente',
    required: true
  },
  responsable: {
    type: mongoose.Schema.ObjectId,
    ref: 'Usuario',
    required: true
  },
  equipo: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Usuario'
  }],
  estado: {
    type: String,
    enum: ['planificacion', 'en_progreso', 'pausado', 'cancelado', 'completado'],
    default: 'planificacion'
  },
  fechaInicio: {
    type: Date,
    required: true
  },
  fechaFinalizacion: {
    type: Date,
    required: true
  },
  presupuesto: {
    monto: {
      type: Number,
      required: true
    },
    moneda: {
      type: String,
      default: 'MXN'
    },
    tipoCobro: {
      type: String,
      enum: ['por_hora', 'precio_fijo'],
      required: true
    }
  },
  tareas: [tareaSchema],
  archivos: [{
    nombre: String,
    url: String,
    tipo: String,
    subidoPor: {
      type: mongoose.Schema.ObjectId,
      ref: 'Usuario'
    },
    fechaSubida: {
      type: Date,
      default: Date.now
    }
  }],
  notas: [{
    contenido: String,
    autor: {
      type: mongoose.Schema.ObjectId,
      ref: 'Usuario'
    },
    fecha: {
      type: Date,
      default: Date.now
    }
  }],
  etiquetas: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
proyectoSchema.index({ cliente: 1, nombre: 1 }, { unique: true });
proyectoSchema.index({ estado: 1 });
proyectoSchema.index({ fechaFinalizacion: 1 });

// Virtual para calcular el progreso del proyecto
proyectoSchema.virtual('progreso').get(function() {
  if (!this.tareas.length) return 0;
  
  const tareasCompletadas = this.tareas.filter(
    tarea => tarea.estado === 'completada'
  ).length;
  
  return Math.round((tareasCompletadas / this.tareas.length) * 100);
});

// Virtual para calcular días restantes
proyectoSchema.virtual('diasRestantes').get(function() {
  const hoy = new Date();
  const fin = new Date(this.fechaFinalizacion);
  const diferencia = fin.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 3600 * 24));
});

// Middleware para actualizar estado basado en fechas
proyectoSchema.pre('save', function(next) {
  const hoy = new Date();
  
  if (hoy > this.fechaFinalizacion && this.estado !== 'completado' && this.estado !== 'cancelado') {
    this.estado = 'atrasado';
  }
  
  next();
});

module.exports = mongoose.model('Proyecto', proyectoSchema);
