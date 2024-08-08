import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { clientService } from '../../services/api';
import {
  PlusIcon,
  UsersIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState('');

  // Configurar la query con refetch
  const { data: clientesResponse, isLoading, error } = useQuery(
    'clientes',
    async () => {
      const response = await clientService.getAll();
      console.log('API Response:', response); // Para depuración
      return response;
    },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0,
      retry: 1,
      onError: (error) => {
        console.error('Error fetching clientes:', error);
      }
    }
  );

  // Extraer los datos de la respuesta
  const clientes = clientesResponse?.data?.data || [];
  console.log('Clientes procesados:', clientes); // Para depuración

  // Filtrar clientes
  const filteredClientes = clientes?.filter(cliente =>
    cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente?.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    console.error('Error en el componente:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error al cargar los clientes. Por favor, intenta de nuevo.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona tus clientes y sus proyectos
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/clientes/nuevo"
            className="btn-primary"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nuevo Cliente
          </Link>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="mt-6">
        <div className="max-w-lg">
          <input
            type="text"
            placeholder="Buscar clientes..."
            className="input-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-3 mt-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando un nuevo cliente
            </p>
            <div className="mt-6">
              <Link
                to="/clientes/nuevo"
                className="btn-primary"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Nuevo Cliente
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredClientes.map((cliente) => (
              <li key={cliente._id}>
                <Link
                  to={`/clientes/${cliente._id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <UsersIcon className="h-5 w-5 text-gray-400" />
                        <p className="ml-2 text-sm font-medium text-primary-600 truncate">
                          {cliente.nombre}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {cliente.proyectos?.length || 0} proyectos
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        {cliente.empresa && (
                          <p className="flex items-center text-sm text-gray-500">
                            <BuildingOfficeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {cliente.empresa}
                          </p>
                        )}
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {cliente.email}
                        </p>
                        {cliente.telefono && (
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <PhoneIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {cliente.telefono}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p className="text-primary-600">
                          Ver detalles
                          <ChevronRightIcon className="ml-1 h-5 w-5 text-primary-500 inline" />
                        </p>
                      </div>
                    </div>
                    {/* Estadísticas rápidas */}
                    <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="col-span-1">
                        <dt className="text-xs font-medium text-gray-500">Proyectos Activos</dt>
                        <dd className="mt-1 text-sm font-semibold text-gray-900">
                          {cliente.proyectos?.filter(p => p.estado === 'en_progreso').length || 0}
                        </dd>
                      </div>
                      <div className="col-span-1">
                        <dt className="text-xs font-medium text-gray-500">Facturas Pendientes</dt>
                        <dd className="mt-1 text-sm font-semibold text-gray-900">
                          {cliente.facturas?.filter(f => f.estado === 'pendiente').length || 0}
                        </dd>
                      </div>
                      <div className="col-span-1">
                        <dt className="text-xs font-medium text-gray-500">Total Facturado</dt>
                        <dd className="mt-1 text-sm font-semibold text-gray-900">
                          ${cliente.facturas?.reduce((total, f) => total + f.total, 0).toLocaleString() || '0'}
                        </dd>
                      </div>
                      <div className="col-span-1">
                        <dt className="text-xs font-medium text-gray-500">Último Proyecto</dt>
                        <dd className="mt-1 text-sm font-semibold text-gray-900">
                          {cliente.proyectos?.[0]?.fechaInicio
                            ? new Date(cliente.proyectos[0].fechaInicio).toLocaleDateString()
                            : 'N/A'}
                        </dd>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
