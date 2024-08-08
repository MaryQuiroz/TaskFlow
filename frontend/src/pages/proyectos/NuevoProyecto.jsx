import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { projectService, clientService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function NuevoProyecto() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Obtener lista de clientes
  const { data: clientesData } = useQuery('clientes', () => clientService.getAll());

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFinalizacion: '',
    estado: 'planificacion',
    cliente: '',
    responsable: user?._id,
    presupuesto: {
      monto: '',
      moneda: 'MXN',
      tipoCobro: 'precio_fijo'
    }
  });

  const { mutate, isLoading } = useMutation(
    (data) => {
      const formattedData = {
        ...data,
        presupuesto: {
          ...data.presupuesto,
          monto: Number(data.presupuesto.monto)
        }
      };
      return projectService.create(formattedData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('proyectos');
        toast.success('Proyecto creado exitosamente');
        navigate('/proyectos');
      },
      onError: (error) => {
        console.error('Error completo:', error.response?.data);
        toast.error(error.response?.data?.message || 'Error al crear el proyecto');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Debes estar autenticado para crear un proyecto');
      return;
    }
    mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('presupuesto.')) {
      const presupuestoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        presupuesto: {
          ...prev.presupuesto,
          [presupuestoField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Nuevo Proyecto
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Ingresa los detalles del nuevo proyecto
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            Nombre del Proyecto *
          </label>
          <input
            type="text"
            name="nombre"
            id="nombre"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            value={formData.nombre}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
            Descripción *
          </label>
          <textarea
            name="descripcion"
            id="descripcion"
            rows={3}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            value={formData.descripcion}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              name="fechaInicio"
              id="fechaInicio"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={formData.fechaInicio}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="fechaFinalizacion" className="block text-sm font-medium text-gray-700">
              Fecha de Finalización *
            </label>
            <input
              type="date"
              name="fechaFinalizacion"
              id="fechaFinalizacion"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={formData.fechaFinalizacion}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              name="estado"
              id="estado"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={formData.estado}
              onChange={handleChange}
            >
              <option value="planificacion">Planificación</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completado">Completado</option>
              <option value="pausado">Pausado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label htmlFor="cliente" className="block text-sm font-medium text-gray-700">
              Cliente *
            </label>
            <select
              name="cliente"
              id="cliente"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={formData.cliente}
              onChange={handleChange}
            >
              <option value="">Selecciona un cliente</option>
              {clientesData?.data?.data?.map((cliente) => (
                <option key={cliente._id} value={cliente._id}>
                  {cliente.nombre} - {cliente.empresa}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="presupuesto.monto" className="block text-sm font-medium text-gray-700">
              Monto del Presupuesto *
            </label>
            <input
              type="number"
              name="presupuesto.monto"
              id="presupuesto.monto"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={formData.presupuesto.monto}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="presupuesto.moneda" className="block text-sm font-medium text-gray-700">
              Moneda
            </label>
            <select
              name="presupuesto.moneda"
              id="presupuesto.moneda"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={formData.presupuesto.moneda}
              onChange={handleChange}
            >
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div>
            <label htmlFor="presupuesto.tipoCobro" className="block text-sm font-medium text-gray-700">
              Tipo de Cobro *
            </label>
            <select
              name="presupuesto.tipoCobro"
              id="presupuesto.tipoCobro"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={formData.presupuesto.tipoCobro}
              onChange={handleChange}
            >
              <option value="precio_fijo">Precio Fijo</option>
              <option value="por_hora">Por Hora</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/proyectos')}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {isLoading ? 'Creando...' : 'Crear Proyecto'}
          </button>
        </div>
      </form>
    </div>
  );
}
