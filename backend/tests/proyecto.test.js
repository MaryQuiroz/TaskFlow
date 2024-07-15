const chai = require('chai');
const expect = chai.expect;
const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const Proyecto = require('../models/Proyecto');
const { connectDB, clearDB, closeDB } = require('./config');

describe('Tests de Proyectos', () => {
  let usuario, cliente;

  // Conectar a la base de datos antes de los tests
  before(async () => {
    await connectDB();
  });

  // Limpiar la base de datos antes de cada test
  beforeEach(async () => {
    await clearDB();
    
    // Crear usuario y cliente para las pruebas
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
  });

  // Cerrar la conexión después de los tests
  after(async () => {
    await closeDB();
  });

  describe('Modelo de Proyecto', () => {
    it('debe crear un nuevo proyecto correctamente', async () => {
      const proyectoData = {
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
      };

      const proyecto = await Proyecto.create(proyectoData);

      expect(proyecto).to.have.property('_id');
      expect(proyecto.nombre).to.equal(proyectoData.nombre);
      expect(proyecto.estado).to.equal('planificacion');
      expect(proyecto.presupuesto.monto).to.equal(1000);
    });

    it('debe validar campos requeridos', async () => {
      try {
        await Proyecto.create({
          nombre: 'Proyecto Test'
        });
        expect.fail('Debería haber lanzado un error de validación');
      } catch (error) {
        expect(error.errors.cliente).to.exist;
        expect(error.errors.responsable).to.exist;
        expect(error.errors.fechaInicio).to.exist;
        expect(error.errors.fechaFinalizacion).to.exist;
      }
    });

    it('debe calcular el progreso correctamente', async () => {
      const proyecto = await Proyecto.create({
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
        },
        tareas: [
          {
            titulo: 'Tarea 1',
            descripcion: 'Descripción tarea 1',
            estado: 'completada'
          },
          {
            titulo: 'Tarea 2',
            descripcion: 'Descripción tarea 2',
            estado: 'pendiente'
          }
        ]
      });

      expect(proyecto.progreso).to.equal(50);
    });
  });

  describe('Gestión de Tareas', () => {
    let proyecto;

    beforeEach(async () => {
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

    it('debe agregar una tarea correctamente', async () => {
      const nuevaTarea = {
        titulo: 'Nueva Tarea',
        descripcion: 'Descripción de la nueva tarea',
        estado: 'pendiente',
        prioridad: 'alta'
      };

      proyecto.tareas.push(nuevaTarea);
      await proyecto.save();

      expect(proyecto.tareas).to.have.lengthOf(1);
      expect(proyecto.tareas[0].titulo).to.equal(nuevaTarea.titulo);
    });

    it('debe actualizar el estado de una tarea', async () => {
      proyecto.tareas.push({
        titulo: 'Tarea Test',
        descripcion: 'Descripción tarea test',
        estado: 'pendiente'
      });
      await proyecto.save();

      const tarea = proyecto.tareas[0];
      tarea.estado = 'completada';
      await proyecto.save();

      expect(proyecto.tareas[0].estado).to.equal('completada');
    });

    it('debe eliminar una tarea', async () => {
      proyecto.tareas.push({
        titulo: 'Tarea Test',
        descripcion: 'Descripción tarea test'
      });
      await proyecto.save();

      proyecto.tareas[0].remove();
      await proyecto.save();

      expect(proyecto.tareas).to.have.lengthOf(0);
    });
  });

  describe('Validaciones y Cálculos', () => {
    it('debe validar fechas de inicio y finalización', async () => {
      const fechaInicio = new Date();
      const fechaFinalizacion = new Date(Date.now() - 24 * 60 * 60 * 1000); // Un día antes

      try {
        await Proyecto.create({
          nombre: 'Proyecto Test',
          descripcion: 'Descripción del proyecto test',
          cliente: cliente._id,
          responsable: usuario._id,
          fechaInicio,
          fechaFinalizacion,
          presupuesto: {
            monto: 1000,
            moneda: 'MXN',
            tipoCobro: 'precio_fijo'
          }
        });
        expect.fail('Debería haber lanzado un error de validación');
      } catch (error) {
        expect(error).to.be.an('error');
      }
    });

    it('debe calcular días restantes correctamente', async () => {
      const fechaInicio = new Date();
      const fechaFinalizacion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días después

      const proyecto = await Proyecto.create({
        nombre: 'Proyecto Test',
        descripcion: 'Descripción del proyecto test',
        cliente: cliente._id,
        responsable: usuario._id,
        fechaInicio,
        fechaFinalizacion,
        presupuesto: {
          monto: 1000,
          moneda: 'MXN',
          tipoCobro: 'precio_fijo'
        }
      });

      expect(proyecto.diasRestantes).to.be.approximately(7, 1);
    });

    it('debe actualizar estado basado en fechas', async () => {
      const proyecto = await Proyecto.create({
        nombre: 'Proyecto Test',
        descripcion: 'Descripción del proyecto test',
        cliente: cliente._id,
        responsable: usuario._id,
        fechaInicio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        fechaFinalizacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        presupuesto: {
          monto: 1000,
          moneda: 'MXN',
          tipoCobro: 'precio_fijo'
        }
      });

      expect(proyecto.estado).to.equal('atrasado');
    });
  });
});
