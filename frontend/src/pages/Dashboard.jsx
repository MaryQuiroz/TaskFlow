import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  BanknotesIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { projectService, clientService, invoiceService } from '../services/api';

const statCards = [
  { name: 'Proyectos Activos', icon: ClipboardDocumentListIcon, color: 'bg-blue-500' },
  { name: 'Total Clientes', icon: UsersIcon, color: 'bg-green-500' },
  { name: 'Facturas Pendientes', icon: DocumentTextIcon, color: 'bg-yellow-500' },
  { name: 'Ingresos del Mes', icon: ChartBarIcon, color: 'bg-purple-500' },
];

export default function Dashboard() {
  const { data: proyectosStats, isLoading: loadingProyectos } = useQuery(
    'proyectosStats',
    () => projectService.getAll({ estado: 'en_progreso' })
  );

  const { data: clientesStats, isLoading: loadingClientes } = useQuery(
    'clientesStats',
    () => clientService.getAll()
  );

  const { data: facturasStats, isLoading: loadingFacturas } = useQuery(
    'facturasStats',
    () => invoiceService.getStats()
  );

  const isLoading = loadingProyectos || loadingClientes || loadingFacturas;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Un vistazo general a tus proyectos, clientes y finanzas
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-blue-100 truncate">
                  Proyectos Activos
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-white">
                    {isLoading ? '...' : proyectosStats?.data?.length || 0}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-green-100 truncate">
                  Total Clientes
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-white">
                    {isLoading ? '...' : clientesStats?.data?.length || 0}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-yellow-100 truncate">
                  Facturas Pendientes
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-white">
                    {isLoading ? '...' : facturasStats?.data?.facturasPendientes || 0}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-purple-100 truncate">
                  Ingresos del Mes
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-white">
                    ${isLoading ? '...' : (facturasStats?.data?.montoCobrado || 0).toLocaleString()}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Secciones principales */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Proyectos Recientes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Proyectos Recientes</h2>
            <Link to="/proyectos" className="text-sm text-primary-600 hover:text-primary-700">
              Ver todos
            </Link>
          </div>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : proyectosStats?.data?.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No hay proyectos activos
            </div>
          ) : (
            <div className="space-y-4">
              {proyectosStats?.data?.slice(0, 3).map((proyecto) => (
                <Link
                  key={proyecto._id}
                  to={`/proyectos/${proyecto._id}`}
                  className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{proyecto.nombre}</h3>
                      <p className="text-sm text-gray-500">{proyecto.cliente.nombre}</p>
                    </div>
                    <span className="badge badge-success">{proyecto.progreso}%</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Facturas Pendientes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Facturas Pendientes</h2>
            <Link to="/facturas" className="text-sm text-primary-600 hover:text-primary-700">
              Ver todas
            </Link>
          </div>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : facturasStats?.data?.facturasPendientes === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No hay facturas pendientes
            </div>
          ) : (
            <div className="space-y-4">
              {/* Aquí irían las facturas pendientes */}
              <div className="text-center py-4 text-gray-500">
                Cargando facturas...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/proyectos/nuevo"
            className="card hover:bg-gray-50 text-center p-6"
          >
            <ClipboardDocumentListIcon className="h-8 w-8 text-primary-600 mx-auto" />
            <h3 className="mt-2 font-medium text-gray-900">Nuevo Proyecto</h3>
          </Link>

          <Link
            to="/clientes/nuevo"
            className="card hover:bg-gray-50 text-center p-6"
          >
            <UsersIcon className="h-8 w-8 text-green-600 mx-auto" />
            <h3 className="mt-2 font-medium text-gray-900">Nuevo Cliente</h3>
          </Link>

          <Link
            to="/facturas/nueva"
            className="card hover:bg-gray-50 text-center p-6"
          >
            <DocumentTextIcon className="h-8 w-8 text-yellow-600 mx-auto" />
            <h3 className="mt-2 font-medium text-gray-900">Nueva Factura</h3>
          </Link>

          <Link
            to="/reportes"
            className="card hover:bg-gray-50 text-center p-6"
          >
            <ChartBarIcon className="h-8 w-8 text-purple-600 mx-auto" />
            <h3 className="mt-2 font-medium text-gray-900">Ver Reportes</h3>
          </Link>
        </div>
      </div>
    </div>
  );
}
