const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
const connectDB = require('./config/database');
connectDB();

// Crear app Express
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Implementar CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : process.env.FRONTEND_URL,
  credentials: true
}));

// Seguridad HTTP headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 100 // límite de 100 requests por windowMs
});
app.use('/api/', limiter);

// Sanitización de datos
app.use(mongoSanitize()); // Prevenir NoSQL injection
app.use(xss()); // Prevenir XSS attacks
app.use(hpp()); // Prevenir HTTP Parameter Pollution

// Logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Montar rutas
const routes = require('./routes');
app.use('/api/v1', routes);

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado'
  });
});

// Manejo de errores JWT
const { handleJWTError } = require('./middleware/auth');
app.use(handleJWTError);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Manejar errores de MongoDB
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Recurso no encontrado',
      error: 'ID inválido'
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      error: messages
    });
  }

  // Manejar errores de duplicados
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Entrada duplicada',
      error: 'Ya existe un registro con estos datos'
    });
  }

  // Error por defecto
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Puerto
const PORT = process.env.PORT || 5001;

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Manejar rechazos de promesas no capturados
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Cerrar servidor y salir del proceso
  server.close(() => process.exit(1));
});

module.exports = app;
