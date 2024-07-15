const chai = require('chai');
const expect = chai.expect;
const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const Proyecto = require('../models/Proyecto');
const Factura = require('../models/Factura');
const { connectDB, clearDB, closeDB } = require('./config');

describe('Tests de Facturación', () => {
  let usuario, cliente, proyecto;

  // Conectar a la base de datos antes de los tests
  before(async () => {
    await connectDB();
  });

  // Limpiar la base de datos y crear datos de prueba antes de cada test
  beforeEach(async () => {
    await clearDB();
    
    // Crear usuario, cliente y proyecto para las pruebas
    usuario = await Usuario.create({
      nombre: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    cliente = await Cliente.create({
      nombre: 'Test Cliente',
      email: 'cliente@example.com',
      empresa: 'Test Company',
      usuario: usuario._id
    });

    proyecto = await Proyecto.create({
      nombre: 'Proyecto Test',
      descripcion: 'Descripción del proyecto test',
      cliente: cliente._id,
      responsable: usuario._id,
      fechaInicio: new Date(),
      fechaFinalizacion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      presupuesto: {
        monto: 1000,
        moneda: 'MXN',
        tipoCobro: 'precio_fijo'
      }
    });
  });

  // Cerrar la conexión después de los tests
  after(async () => {
    await closeDB();
  });

  describe('Modelo de Factura', () => {
    it('debe crear una nueva factura correctamente', async () => {
      const facturaData = {
        numero: await Factura.generarNumeroFactura(),
        cliente: cliente._id,
        proyecto: proyecto._id,
        emisor: usuario._id,
        fechaEmision: new Date(),
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: [{
          descripcion: 'Servicio 1',
          cantidad: 1,
          precioUnitario: 1000,
          impuesto: 160,
          subtotal: 1000
        }],
        subtotal: 1000,
        impuestos: {
          iva: 160
        },
        total: 1160,
        metodoPago: 'transferencia'
      };

      const factura = await Factura.create(facturaData);

      expect(factura).to.have.property('_id');
      expect(factura.numero).to.match(/^FAC-\d{6}$/);
      expect(factura.estado).to.equal('pendiente');
      expect(factura.total).to.equal(1160);
    });

    it('debe generar números de factura secuenciales', async () => {
      const numero1 = await Factura.generarNumeroFactura();
      const numero2 = await Factura.generarNumeroFactura();

      const num1 = parseInt(numero1.split('-')[1]);
      const num2 = parseInt(numero2.split('-')[1]);

      expect(num2).to.equal(num1 + 1);
    });

    it('debe validar campos requeridos', async () => {
      try {
        await Factura.create({
          numero: 'FAC-000001'
        });
        expect.fail('Debería haber lanzado un error de validación');
      } catch (error) {
        expect(error.errors.cliente).to.exist;
        expect(error.errors.proyecto).to.exist;
        expect(error.errors.emisor).to.exist;
        expect(error.errors.fechaVencimiento).to.exist;
      }
    });
  });

  describe('Gestión de Pagos', () => {
    let factura;

    beforeEach(async () => {
      factura = await Factura.create({
        numero: await Factura.generarNumeroFactura(),
        cliente: cliente._id,
        proyecto: proyecto._id,
        emisor: usuario._id,
        fechaEmision: new Date(),
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: [{
          descripcion: 'Servicio 1',
          cantidad: 1,
          precioUnitario: 1000,
          impuesto: 160,
          subtotal: 1000
        }],
        subtotal: 1000,
        impuestos: {
          iva: 160
        },
        total: 1160,
        metodoPago: 'transferencia'
      });
    });

    it('debe registrar un pago correctamente', async () => {
      factura.historialPagos.push({
        fecha: new Date(),
        monto: 500,
        metodoPago: 'transferencia',
        referencia: 'REF-001'
      });

      await factura.save();

      expect(factura.historialPagos).to.have.lengthOf(1);
      expect(factura.montoPendiente).to.equal(660);
    });

    it('debe actualizar estado a pagada cuando se completa el pago', async () => {
      factura.historialPagos.push({
        fecha: new Date(),
        monto: 1160,
        metodoPago: 'transferencia',
        referencia: 'REF-001'
      });

      await factura.save();

      expect(factura.estado).to.equal('pagada');
      expect(factura.montoPendiente).to.equal(0);
    });

    it('debe calcular monto pendiente correctamente con pagos parciales', async () => {
      factura.historialPagos.push({
        fecha: new Date(),
        monto: 500,
        metodoPago: 'transferencia',
        referencia: 'REF-001'
      });

      await factura.save();

      factura.historialPagos.push({
        fecha: new Date(),
        monto: 300,
        metodoPago: 'transferencia',
        referencia: 'REF-002'
      });

      await factura.save();

      expect(factura.montoPendiente).to.equal(360);
      expect(factura.estado).to.equal('pendiente');
    });
  });

  describe('Validaciones y Estados', () => {
    it('debe actualizar a vencida cuando pasa la fecha de vencimiento', async () => {
      const factura = await Factura.create({
        numero: await Factura.generarNumeroFactura(),
        cliente: cliente._id,
        proyecto: proyecto._id,
        emisor: usuario._id,
        fechaEmision: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
        fechaVencimiento: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        items: [{
          descripcion: 'Servicio 1',
          cantidad: 1,
          precioUnitario: 1000,
          impuesto: 160,
          subtotal: 1000
        }],
        subtotal: 1000,
        impuestos: {
          iva: 160
        },
        total: 1160,
        metodoPago: 'transferencia'
      });

      expect(factura.estado).to.equal('vencida');
      expect(factura.diasVencidos).to.be.approximately(1, 1);
    });

    it('debe calcular correctamente los totales con múltiples items', async () => {
      const facturaData = {
        numero: await Factura.generarNumeroFactura(),
        cliente: cliente._id,
        proyecto: proyecto._id,
        emisor: usuario._id,
        fechaEmision: new Date(),
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: [
          {
            descripcion: 'Servicio 1',
            cantidad: 2,
            precioUnitario: 1000,
            impuesto: 320,
            subtotal: 2000
          },
          {
            descripcion: 'Servicio 2',
            cantidad: 1,
            precioUnitario: 500,
            impuesto: 80,
            subtotal: 500
          }
        ],
        subtotal: 2500,
        impuestos: {
          iva: 400
        },
        total: 2900,
        metodoPago: 'transferencia'
      };

      const factura = await Factura.create(facturaData);

      expect(factura.subtotal).to.equal(2500);
      expect(factura.total).to.equal(2900);
    });
  });
});
