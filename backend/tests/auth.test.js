const chai = require('chai');
const expect = chai.expect;
const Usuario = require('../models/Usuario');
const { connectDB, clearDB, closeDB } = require('./config');

describe('Tests de Autenticación', () => {
  // Conectar a la base de datos antes de los tests
  before(async () => {
    await connectDB();
  });

  // Limpiar la base de datos antes de cada test
  beforeEach(async () => {
    await clearDB();
  });

  // Cerrar la conexión después de los tests
  after(async () => {
    await closeDB();
  });

  describe('Modelo de Usuario', () => {
    it('debe crear un nuevo usuario correctamente', async () => {
      const usuarioData = {
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const usuario = await Usuario.create(usuarioData);

      expect(usuario).to.have.property('_id');
      expect(usuario.nombre).to.equal(usuarioData.nombre);
      expect(usuario.email).to.equal(usuarioData.email);
      // La contraseña debe estar hasheada
      expect(usuario.password).to.not.equal(usuarioData.password);
    });

    it('debe requerir email y contraseña', async () => {
      try {
        await Usuario.create({
          nombre: 'Test User'
        });
        // Si llegamos aquí, el test debe fallar
        expect.fail('Debería haber lanzado un error de validación');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.errors.email).to.exist;
        expect(error.errors.password).to.exist;
      }
    });

    it('debe validar el formato del email', async () => {
      try {
        await Usuario.create({
          nombre: 'Test User',
          email: 'invalid-email',
          password: 'password123'
        });
        expect.fail('Debería haber lanzado un error de validación');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.errors.email).to.exist;
      }
    });

    it('debe validar la longitud mínima de la contraseña', async () => {
      try {
        await Usuario.create({
          nombre: 'Test User',
          email: 'test@example.com',
          password: '123'
        });
        expect.fail('Debería haber lanzado un error de validación');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.errors.password).to.exist;
      }
    });
  });

  describe('Métodos del Usuario', () => {
    let usuario;

    beforeEach(async () => {
      usuario = await Usuario.create({
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('debe generar un JWT válido', () => {
      const token = usuario.getSignedJwtToken();
      expect(token).to.be.a('string');
      expect(token.split('.')).to.have.lengthOf(3);
    });

    it('debe verificar la contraseña correctamente', async () => {
      const isMatch = await usuario.matchPassword('password123');
      expect(isMatch).to.be.true;
    });

    it('debe rechazar una contraseña incorrecta', async () => {
      const isMatch = await usuario.matchPassword('wrongpassword');
      expect(isMatch).to.be.false;
    });

    it('debe generar un token de reset de contraseña', () => {
      const resetToken = usuario.getResetPasswordToken();
      expect(resetToken).to.be.a('string');
      expect(usuario.resetPasswordToken).to.exist;
      expect(usuario.resetPasswordExpire).to.exist;
    });
  });

  describe('Validaciones de Usuario', () => {
    it('debe prevenir emails duplicados', async () => {
      await Usuario.create({
        nombre: 'Test User 1',
        email: 'test@example.com',
        password: 'password123'
      });

      try {
        await Usuario.create({
          nombre: 'Test User 2',
          email: 'test@example.com',
          password: 'password456'
        });
        expect.fail('Debería haber lanzado un error de duplicado');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.code).to.equal(11000);
      }
    });

    it('debe trimear el nombre y email', async () => {
      const usuario = await Usuario.create({
        nombre: '  Test User  ',
        email: '  test@example.com  ',
        password: 'password123'
      });

      expect(usuario.nombre).to.equal('Test User');
      expect(usuario.email).to.equal('test@example.com');
    });

    it('debe establecer rol por defecto como "usuario"', async () => {
      const usuario = await Usuario.create({
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      expect(usuario.rol).to.equal('usuario');
    });
  });
});
