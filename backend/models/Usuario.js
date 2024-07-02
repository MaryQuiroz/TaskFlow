const mongoose = require('mongoose'); const bcrypt = require('bcryptjs'); const jwt = require('jsonwebtoken'); const usuarioSchema = new mongoose.Schema({ nombre: { type: String, required: [true, 'Por favor ingrese su nombre'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Por favor ingrese su email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingrese un email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'Por favor ingrese una contraseña'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  rol: {
    type: String,
    enum: ['admin', 'usuario'],
    default: 'usuario'
  },
  configuracion: {
    notificacionesEmail: {
      type: Boolean,
      default: true
    },
    temaOscuro: {
      type: Boolean,
      default: false
    }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encriptar contraseña antes de guardar
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Firmar JWT y retornar
usuarioSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Verificar contraseña
usuarioSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generar y hashear token para reset de password
usuarioSchema.methods.getResetPasswordToken = function() {
  // Generar token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hashear token y establecer resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Establecer expiración
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutos

  return resetToken;
};

module.exports = mongoose.model('Usuario', usuarioSchema);
