import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserCircleIcon, KeyIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Perfil() {
  const { user, updateProfile, updatePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(profileData);
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Contraseña actualizada exitosamente');
    } catch (error) {
      console.error('Error actualizando contraseña:', error);
      toast.error('Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Encabezado */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Perfil</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra tu información personal y preferencias
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-8 divide-y divide-gray-200">
              {/* Información del perfil */}
              <div className="space-y-6 sm:space-y-5">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Información Personal
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Actualiza tu información básica
                  </p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
                    <label
                      htmlFor="nombre"
                      className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                      Nombre completo
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <input
                        type="text"
                        name="nombre"
                        id="nombre"
                        value={profileData.nombre}
                        onChange={(e) =>
                          setProfileData({ ...profileData, nombre: e.target.value })
                        }
                        className="input-primary"
                      />
                    </div>
                  </div>

                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                      Email
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({ ...profileData, email: e.target.value })
                        }
                        className="input-primary"
                      />
                    </div>
                  </div>

                  <div className="pt-5">
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                      >
                        {loading ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Cambio de contraseña */}
              <div className="pt-8 space-y-6 sm:space-y-5">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Cambiar Contraseña
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Asegúrate de usar una contraseña segura
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                      Contraseña actual
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <input
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="input-primary"
                      />
                    </div>
                  </div>

                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                      Nueva contraseña
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="input-primary"
                      />
                    </div>
                  </div>

                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                      Confirmar contraseña
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="input-primary"
                      />
                    </div>
                  </div>

                  <div className="pt-5">
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                      >
                        {loading ? 'Actualizando...' : 'Cambiar contraseña'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
