import { useState } from 'react';
import { Switch } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';
import {
  BellIcon,
  SunIcon,
  MoonIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Configuracion() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notificacionesEmail: user?.configuracion?.notificacionesEmail ?? true,
    notificacionesPush: false,
    temaOscuro: user?.configuracion?.temaOscuro ?? false,
    recordatoriosFacturas: true,
    alertasProyectos: true,
  });

  const handleToggle = async (setting) => {
    const newSettings = {
      ...settings,
      [setting]: !settings[setting],
    };
    
    setSettings(newSettings);

    try {
      setLoading(true);
      await updateProfile({
        configuracion: newSettings,
      });
      toast.success('Configuración actualizada');
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      toast.error('Error al actualizar la configuración');
      // Revertir el cambio en caso de error
      setSettings(settings);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Encabezado */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Configuración</h1>
          <p className="mt-1 text-sm text-gray-500">
            Personaliza tu experiencia en la aplicación
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {/* Notificaciones */}
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Notificaciones
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configura cómo quieres recibir las notificaciones
                </p>

                <div className="mt-6 space-y-4">
                  <Switch.Group as="div" className="flex items-center justify-between">
                    <Switch.Label as="span" className="flex-grow flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        Notificaciones por email
                      </span>
                      <span className="text-sm text-gray-500">
                        Recibe actualizaciones importantes en tu correo
                      </span>
                    </Switch.Label>
                    <Switch
                      checked={settings.notificacionesEmail}
                      onChange={() => handleToggle('notificacionesEmail')}
                      className={classNames(
                        settings.notificacionesEmail ? 'bg-primary-600' : 'bg-gray-200',
                        'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                      )}
                      disabled={loading}
                    >
                      <span
                        aria-hidden="true"
                        className={classNames(
                          settings.notificacionesEmail ? 'translate-x-5' : 'translate-x-0',
                          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                        )}
                      />
                    </Switch>
                  </Switch.Group>

                  <Switch.Group as="div" className="flex items-center justify-between">
                    <Switch.Label as="span" className="flex-grow flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        Notificaciones push
                      </span>
                      <span className="text-sm text-gray-500">
                        Recibe notificaciones en tiempo real
                      </span>
                    </Switch.Label>
                    <Switch
                      checked={settings.notificacionesPush}
                      onChange={() => handleToggle('notificacionesPush')}
                      className={classNames(
                        settings.notificacionesPush ? 'bg-primary-600' : 'bg-gray-200',
                        'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                      )}
                      disabled={loading}
                    >
                      <span
                        aria-hidden="true"
                        className={classNames(
                          settings.notificacionesPush ? 'translate-x-5' : 'translate-x-0',
                          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                        )}
                      />
                    </Switch>
                  </Switch.Group>
                </div>
              </div>

              {/* Apariencia */}
              <div className="pt-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Apariencia
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Personaliza el aspecto visual de la aplicación
                </p>

                <div className="mt-6">
                  <Switch.Group as="div" className="flex items-center justify-between">
                    <Switch.Label as="span" className="flex-grow flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        Tema oscuro
                      </span>
                      <span className="text-sm text-gray-500">
                        Activa el modo oscuro para reducir el cansancio visual
                      </span>
                    </Switch.Label>
                    <Switch
                      checked={settings.temaOscuro}
                      onChange={() => handleToggle('temaOscuro')}
                      className={classNames(
                        settings.temaOscuro ? 'bg-primary-600' : 'bg-gray-200',
                        'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                      )}
                      disabled={loading}
                    >
                      <span
                        aria-hidden="true"
                        className={classNames(
                          settings.temaOscuro ? 'translate-x-5' : 'translate-x-0',
                          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                        )}
                      />
                    </Switch>
                  </Switch.Group>
                </div>
              </div>

              {/* Recordatorios */}
              <div className="pt-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recordatorios y Alertas
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configura los recordatorios automáticos
                </p>

                <div className="mt-6 space-y-4">
                  <Switch.Group as="div" className="flex items-center justify-between">
                    <Switch.Label as="span" className="flex-grow flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        Recordatorios de facturas
                      </span>
                      <span className="text-sm text-gray-500">
                        Recibe recordatorios de facturas pendientes y vencidas
                      </span>
                    </Switch.Label>
                    <Switch
                      checked={settings.recordatoriosFacturas}
                      onChange={() => handleToggle('recordatoriosFacturas')}
                      className={classNames(
                        settings.recordatoriosFacturas ? 'bg-primary-600' : 'bg-gray-200',
                        'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                      )}
                      disabled={loading}
                    >
                      <span
                        aria-hidden="true"
                        className={classNames(
                          settings.recordatoriosFacturas ? 'translate-x-5' : 'translate-x-0',
                          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                        )}
                      />
                    </Switch>
                  </Switch.Group>

                  <Switch.Group as="div" className="flex items-center justify-between">
                    <Switch.Label as="span" className="flex-grow flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        Alertas de proyectos
                      </span>
                      <span className="text-sm text-gray-500">
                        Recibe alertas sobre fechas límite y cambios en proyectos
                      </span>
                    </Switch.Label>
                    <Switch
                      checked={settings.alertasProyectos}
                      onChange={() => handleToggle('alertasProyectos')}
                      className={classNames(
                        settings.alertasProyectos ? 'bg-primary-600' : 'bg-gray-200',
                        'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                      )}
                      disabled={loading}
                    >
                      <span
                        aria-hidden="true"
                        className={classNames(
                          settings.alertasProyectos ? 'translate-x-5' : 'translate-x-0',
                          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                        )}
                      />
                    </Switch>
                  </Switch.Group>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
