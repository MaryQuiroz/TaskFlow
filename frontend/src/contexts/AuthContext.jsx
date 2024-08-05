import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const checkAuth = async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { token: newToken, usuario } = response.data;
      
      setToken(newToken);
      setUser(usuario);
      localStorage.setItem('token', newToken);
      
      toast.success('¡Bienvenido!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { token: newToken, usuario } = response.data;
      
      setToken(newToken);
      setUser(usuario);
      localStorage.setItem('token', newToken);
      
      toast.success('¡Registro exitoso!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      console.error('Error en registro:', error);
      toast.error(error.response?.data?.message || 'Error al registrarse');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
    toast.success('Sesión cerrada');
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      setUser(response.data.data);
      toast.success('Perfil actualizado exitosamente');
      return true;
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar perfil');
      return false;
    }
  };

  const updatePassword = async (passwords) => {
    try {
      await authService.updatePassword(passwords);
      toast.success('Contraseña actualizada exitosamente');
      return true;
    } catch (error) {
      console.error('Error actualizando contraseña:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar contraseña');
      return false;
    }
  };

  const forgotPassword = async (email) => {
    try {
      await authService.forgotPassword(email);
      toast.success('Se ha enviado un email con las instrucciones');
      return true;
    } catch (error) {
      console.error('Error en recuperación de contraseña:', error);
      toast.error(error.response?.data?.message || 'Error al procesar la solicitud');
      return false;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await authService.resetPassword(token, password);
      toast.success('Contraseña restablecida exitosamente');
      navigate('/login');
      return true;
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      toast.error(error.response?.data?.message || 'Error al restablecer contraseña');
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
