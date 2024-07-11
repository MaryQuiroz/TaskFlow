const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  registro,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword
} = require('../controllers/authController');

// Rutas públicas
router.post('/registro', registro);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

// Rutas protegidas
router.use(protect); // Middleware de autenticación para las siguientes rutas

router.get('/me', getMe);
router.put('/update-details', updateDetails);
router.put('/update-password', updatePassword);
router.get('/logout', logout);

module.exports = router;
