import axios from 'axios';
import toast from 'react-hot-toast';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Error en la operación';
    
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }
    // Manejar errores de validación
    else if (error.response?.status === 400) {
      toast.error(message);
    }
    // Manejar errores de permisos
    else if (error.response?.status === 403) {
      toast.error('No tiene permisos para realizar esta acción');
    }
    // Manejar errores del servidor
    else if (error.response?.status === 500) {
      console.error('Error del servidor:', error.response?.data);
      toast.error('Error interno del servidor');
    }
    // Otros errores
    else {
      console.error('Error en la petición:', error);
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/registro', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-details', data),
  updatePassword: (data) => api.put('/auth/update-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password })
};

// Servicios de proyectos
export const projectService = {
  getAll: (params) => api.get('/proyectos', { params }),
  getById: (id) => api.get(`/proyectos/${id}`),
  create: (data) => api.post('/proyectos', data),
  update: (id, data) => api.put(`/proyectos/${id}`, data),
  delete: (id) => api.delete(`/proyectos/${id}`),
  // Tareas
  addTask: (projectId, data) => api.post(`/proyectos/${projectId}/tareas`, data),
  updateTask: (projectId, taskId, data) => api.put(`/proyectos/${projectId}/tareas/${taskId}`, data),
  deleteTask: (projectId, taskId) => api.delete(`/proyectos/${projectId}/tareas/${taskId}`)
};

// Servicios de clientes
export const clientService = {
  getAll: (params) => api.get('/clientes', { params }),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
  getStats: (id) => api.get(`/clientes/${id}/estadisticas`)
};

// Servicios de facturas
export const invoiceService = {
  getAll: (params) => api.get('/facturas', { params }),
  getById: (id) => api.get(`/facturas/${id}`),
  create: (data) => api.post('/facturas', data),
  update: (id, data) => api.put(`/facturas/${id}`, data),
  registerPayment: (id, data) => api.post(`/facturas/${id}/pagos`, data),
  sendReminder: (id) => api.post(`/facturas/${id}/recordatorio`),
  getStats: () => api.get('/facturas/estadisticas')
};

export default api;
