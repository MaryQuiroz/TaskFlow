import { useQuery } from 'react-query';
import { projectService, clientService, invoiceService } from '../../services/api';
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  FolderIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function Reportes() {
  // Obtener estadísticas de proyectos
  const { data: proyectosStats, isLoading: loadingProyectos } = useQuery(
    'proyectosStats',
    () => projectService.getAll()
  );

  // Obtener estadísticas de clientes
  const { data: clientesStats, isLoading: loadingClientes } = useQuery(
    'clientesStats',
    () => clientService.getAll()
  );

  // Obtener estadísticas de facturación
  const { data: facturasStats, isLoading: loadingFacturas } = useQuery(
    'facturasStats',
    () => invoiceService.getStats()
  );

  const isLoading = loadingProyectos || loadingClientes || loadingFacturas;

  // Calcular estadísticas
  const stats = {
    proyectos: {
      total: proyectosStats?.data?.length || 0,
      activos: proyectosStats?.data?.filter(p => p.estado === 'en_progreso').length || 0,
      completados: proyectosStats?.data?.filter(p => p.estado === 'completado').length || 0,
      atrasados: proyectosStats?.data?.filter(p => new Date(p.fechaFinalizacion) < new Date()).length || 0,
    },
    clientes: {
      total: clientesStats?.data?.length || 0,
      activos: clientesStats?.data?.filter(c => c.proyectos?.some(p => p.estado === 'en_progreso')).length || 0,
    },
    facturas: facturasStats?.data || {
      totalFacturas: 0,
      facturasPendientes: 0,
      facturasVencidas: 0,
      facturasPagadas: 0,
      montoTotalFacturado: 0,
      montoPendiente: 0,
      montoCobrado: 0,
    },
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reportes y Estadísticas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Análisis general del rendimiento de tu negocio
          </p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Proyectos */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Proyectos Activos
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoading ? '...' : stats.proyectos.activos}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="font-medium text-primary-700">
                Total de proyectos: {stats.proyectos.total}
              </div>
              <div className="mt-1">
                <span className="text-green-600">
                  {stats.proyectos.completados} completados
                </span>
                {' · '}
                <span className="text-red-600">
                  {stats.proyectos.atrasados} atrasados
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clientes */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Clientes Activos
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoading ? '...' : stats.clientes.activos}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="font-medium text-primary-700">
                Total de clientes: {stats.clientes.total}
              </div>
            </div>
          </div>
        </div>

        {/* Facturación */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ingresos Totales
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoading
                        ? '...'
                        : stats.facturas.montoTotalFacturado.toLocaleString('es-MX', {
                            style: 'currency',
                            currency: 'MXN',
                          })}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="font-medium text-primary-700">
                {stats.facturas.facturasPagadas} facturas pagadas
              </div>
              <div className="mt-1">
                <span className="text-yellow-600">
                  {stats.facturas.facturasPendientes} pendientes
                </span>
                {' · '}
                <span className="text-red-600">
                  {stats.facturas.facturasVencidas} vencidas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas detalladas */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Rendimiento financiero */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Rendimiento Financiero
            </h3>
            <dl className="mt-5 grid grid-cols-1 gap-5">
              <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Monto Cobrado</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {stats.facturas.montoCobrado.toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  })}
                </dd>
                <dd className="mt-2 flex items-center text-sm text-green-600">
                  <ArrowTrendingUpIcon
                    className="h-5 w-5 flex-shrink-0 text-green-500"
                    aria-hidden="true"
                  />
                  <span className="ml-2">
                    {((stats.facturas.montoCobrado / stats.facturas.montoTotalFacturado) * 100).toFixed(1)}% del total facturado
                  </span>
                </dd>
              </div>
              <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Monto Pendiente</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {stats.facturas.montoPendiente.toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  })}
                </dd>
                <dd className="mt-2 flex items-center text-sm text-yellow-600">
                  <ClockIcon
                    className="h-5 w-5 flex-shrink-0 text-yellow-500"
                    aria-hidden="true"
                  />
                  <span className="ml-2">
                    {stats.facturas.facturasPendientes} facturas por cobrar
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Eficiencia operativa */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Eficiencia Operativa
            </h3>
            <dl className="mt-5 grid grid-cols-1 gap-5">
              <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Tasa de Completitud</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {((stats.proyectos.completados / stats.proyectos.total) * 100).toFixed(1)}%
                </dd>
                <dd className="mt-2 flex items-center text-sm text-green-600">
                  <ArrowTrendingUpIcon
                    className="h-5 w-5 flex-shrink-0 text-green-500"
                    aria-hidden="true"
                  />
                  <span className="ml-2">
                    {stats.proyectos.completados} proyectos completados
                  </span>
                </dd>
              </div>
              <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Proyectos por Cliente</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {(stats.proyectos.total / stats.clientes.total || 0).toFixed(1)}
                </dd>
                <dd className="mt-2 flex items-center text-sm text-primary-600">
                  <UsersIcon
                    className="h-5 w-5 flex-shrink-0 text-primary-500"
                    aria-hidden="true"
                  />
                  <span className="ml-2">
                    Promedio de proyectos por cliente
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
