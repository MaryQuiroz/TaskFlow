import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { invoiceService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  PlusIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

export default function Facturas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todas');
  const { token } = useAuth();

  const { data, isLoading, error } = useQuery(
    ['facturas', filterStatus],
    async () => {
      const response = await invoiceService.getAll({ 
        estado: filterStatus !== 'todas' ? filterStatus : undefined 
      });
      return response.data;
    },
    {
      enabled: !!token,
      staleTime: 30000, // Considerar datos frescos por 30 segundos
      retry: 2, // Reintentar 2 veces en caso de error
    }
  );

  // Extraer las facturas de forma segura
  const facturas = data?.data || [];

  const filteredFacturas = facturas.filter(factura =>
    factura.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    factura.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeClass = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'pagada':
        return 'bg-green-100 text-green-800';
      case 'vencida':
        return 'bg-red-100 text-red-800';
      case 'cancelada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error al cargar facturas</h3>
        <p className="mt-1 text-sm text-gray-500">
          {error.response?.data?.message || 'Por favor, intenta nuevamente más tarde'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Facturas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona tus facturas y pagos
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/facturas/nueva"
            className="btn-primary"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nueva Factura
          </Link>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mt-6 sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-1">
          <input
            type="text"
            placeholder="Buscar facturas..."
            className="input-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <select
            className="input-primary"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="todas">Todas las facturas</option>
            <option value="pendiente">Pendientes</option>
            <option value="pagada">Pagadas</option>
            <option value="vencida">Vencidas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Lista de facturas */}
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
        ) : filteredFacturas.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay facturas</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando una nueva factura
            </p>
            <div className="mt-6">
              <Link
                to="/facturas/nueva"
                className="btn-primary"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Nueva Factura
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredFacturas.map((factura) => (
              <li key={factura._id}>
                <Link
                  to={`/facturas/${factura._id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        <p className="ml-2 text-sm font-medium text-primary-600 truncate">
                          {factura.numero}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            factura.estado
                          )}`}
                        >
                          {factura.estado}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <BuildingOfficeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {factura.cliente?.nombre}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          Vence: {new Date(factura.fechaVencimiento).toLocaleDateString()}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <CurrencyDollarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {factura.total.toLocaleString('es-MX', {
                            style: 'currency',
                            currency: factura.moneda
                          })}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p className="text-primary-600">
                          Ver detalles
                          <ChevronRightIcon className="ml-1 h-5 w-5 text-primary-500 inline" />
                        </p>
                      </div>
                    </div>
                    {/* Información de pagos */}
                    {factura.estado !== 'pagada' && (
                      <div className="mt-2 text-sm">
                        <p className="text-gray-500">
                          Pendiente:{' '}
                          <span className="font-medium text-gray-900">
                            {factura.montoPendiente?.toLocaleString('es-MX', {
                              style: 'currency',
                              currency: factura.moneda
                            })}
                          </span>
                        </p>
                      </div>
                    )}
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
