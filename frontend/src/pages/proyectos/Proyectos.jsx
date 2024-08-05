import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/api';
import {
  PlusIcon,
  FolderIcon,
  ChevronRightIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function Proyectos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  const { data: proyectos, isLoading } = useQuery(
    ['proyectos', filterStatus],
    () => projectService.getAll({ estado: filterStatus !== 'todos' ? filterStatus : undefined })
  );

  const filteredProyectos = proyectos?.data?.filter(proyecto =>
    proyecto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proyecto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeClass = (estado) => {
    switch (estado) {
      case 'planificacion':
        return 'bg-blue-100 text-blue-800';
      case 'en_progreso':
        return 'bg-yellow-100 text-yellow-800';
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'pausado':
        return 'bg-gray-100 text-gray-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Proyectos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona tus proyectos y su progreso
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/proyectos/nuevo"
            className="btn-primary"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nuevo Proyecto
          </Link>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mt-6 sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-1">
          <input
            type="text"
            placeholder="Buscar proyectos..."
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
            <option value="todos">Todos los estados</option>
            <option value="planificacion">Planificación</option>
            <option value="en_progreso">En Progreso</option>
            <option value="completado">Completado</option>
            <option value="pausado">Pausado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Lista de proyectos */}
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
        ) : filteredProyectos?.length === 0 ? (
          <div className="text-center py-12">
            <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay proyectos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando un nuevo proyecto
            </p>
            <div className="mt-6">
              <Link
                to="/proyectos/nuevo"
                className="btn-primary"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Nuevo Proyecto
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredProyectos?.map((proyecto) => (
              <li key={proyecto._id}>
                <Link
                  to={`/proyectos/${proyecto._id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FolderIcon className="h-5 w-5 text-gray-400" />
                        <p className="ml-2 text-sm font-medium text-primary-600 truncate">
                          {proyecto.nombre}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            proyecto.estado
                          )}`}
                        >
                          {proyecto.estado.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <UserGroupIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {proyecto.cliente?.nombre}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {new Date(proyecto.fechaFinalizacion).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p className="text-primary-600">
                          Ver detalles
                          <ChevronRightIcon className="ml-1 h-5 w-5 text-primary-500 inline" />
                        </p>
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
