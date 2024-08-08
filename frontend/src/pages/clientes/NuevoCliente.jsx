import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { clientService } from '../../services/api';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

export default function NuevoCliente() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
  });

  const { mutate: crearCliente, isLoading } = useMutation(
    (data) => clientService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clientes');
        toast.success('Cliente creado exitosamente');
        navigate('/clientes');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al crear el cliente');
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    crearCliente(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center">
            <button
              onClick={() => navigate('/clientes')}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Nuevo Cliente</h1>
          </div>
          <p className="mt-2 text-sm text-gray-700">
            Ingresa los datos del nuevo cliente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-w-2xl">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            Nombre *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="nombre"
              id="nombre"
              required
              className="input-primary pl-10"
              placeholder="Juan Pérez"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="empresa" className="block text-sm font-medium text-gray-700">
            Empresa
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="empresa"
              id="empresa"
              className="input-primary pl-10"
              placeholder="Empresa S.A."
              value={formData.empresa}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="input-primary pl-10"
              placeholder="juan@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              name="telefono"
              id="telefono"
              className="input-primary pl-10"
              placeholder="+1234567890"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/clientes')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creando...' : 'Crear Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}
