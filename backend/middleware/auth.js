const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Proteger rutas
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Verificar si existe el token en los headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No está autorizado para acceder a esta ruta'
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Agregar usuario a req
      req.user = await Usuario.findById(decoded.id);
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Token no válido'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al autenticar usuario',
      error: error.message
    });
  }
};

// Autorizar roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `El rol ${req.user.rol} no está autorizado para acceder a esta ruta`
      });
    }
    next();
  };
};

// Verificar propiedad del recurso
exports.checkOwnership = (Model) => async (req, res, next) => {
  try {
    const recurso = await Model.findById(req.params.id);

    if (!recurso) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }

    // Verificar si el usuario es propietario o admin
    // Si es un proyecto, verificar el campo 'responsable' en lugar de 'usuario'
    const userId = req.user.id;
    const isOwner = Model.modelName === 'Proyecto'
      ? recurso.responsable?.toString() === userId
      : recurso.usuario?.toString() === userId;

    if (!isOwner && req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para modificar este recurso'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar propiedad del recurso',
      error: error.message
    });
  }
};

// Middleware para manejar errores de JWT
exports.handleJWTError = (err, req, res, next) => {
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  next(err);
};
