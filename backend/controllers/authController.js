const crypto = require('crypto');
const Usuario = require('../models/Usuario');
const sendEmail = require('../utils/sendEmail'); // Lo crearemos después

// Registrar usuario
exports.registro = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Crear usuario
    const usuario = await Usuario.create({
      nombre,
      email,
      password,
      rol: rol || 'usuario' // Por defecto será 'usuario'
    });

    enviarTokenRespuesta(usuario, 201, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar email y password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione email y contraseña'
      });
    }

    // Verificar usuario
    const usuario = await Usuario.findOne({ email }).select('+password');

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isMatch = await usuario.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    enviarTokenRespuesta(usuario, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// Cerrar sesión
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
};

// Obtener usuario actual
exports.getMe = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del usuario',
      error: error.message
    });
  }
};

// Actualizar datos del usuario
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      nombre: req.body.nombre,
      email: req.body.email
    };

    const usuario = await Usuario.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar información del usuario',
      error: error.message
    });
  }
};

// Actualizar contraseña
exports.updatePassword = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id).select('+password');

    // Verificar contraseña actual
    if (!(await usuario.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    usuario.password = req.body.newPassword;
    await usuario.save();

    enviarTokenRespuesta(usuario, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar contraseña',
      error: error.message
    });
  }
};

// Olvidé mi contraseña
exports.forgotPassword = async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ email: req.body.email });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'No existe un usuario con ese email'
      });
    }

    // Obtener token de reset
    const resetToken = usuario.getResetPasswordToken();

    await usuario.save({ validateBeforeSave: false });

    // Crear URL de reset
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

    const mensaje = `Has solicitado resetear tu contraseña. Por favor haz una petición PUT a: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: usuario.email,
        subject: 'Token para resetear contraseña',
        mensaje
      });

      res.status(200).json({
        success: true,
        message: 'Email enviado'
      });
    } catch (err) {
      usuario.resetPasswordToken = undefined;
      usuario.resetPasswordExpire = undefined;

      await usuario.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Error al enviar el email'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud de reset de contraseña',
      error: error.message
    });
  }
};

// Resetear contraseña
exports.resetPassword = async (req, res) => {
  try {
    // Obtener token hasheado
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const usuario = await Usuario.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!usuario) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Establecer nueva contraseña
    usuario.password = req.body.password;
    usuario.resetPasswordToken = undefined;
    usuario.resetPasswordExpire = undefined;
    await usuario.save();

    enviarTokenRespuesta(usuario, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al resetear la contraseña',
      error: error.message
    });
  }
};

// Función auxiliar para enviar respuesta con token
const enviarTokenRespuesta = (usuario, statusCode, res) => {
  const token = usuario.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    usuario: {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    }
  });
};
