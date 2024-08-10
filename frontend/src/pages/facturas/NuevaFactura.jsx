import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const NuevaFactura = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    cliente: '',
    proyecto: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    items: [{
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
      impuesto: 0
    }],
    impuestos: {
      iva: 0,
      otros: 0
    },
    metodoPago: 'transferencia',
    moneda: 'MXN',
    notas: '',
    datosFacturacion: {
      rfc: '',
      razonSocial: '',
      direccion: {
        calle: '',
        ciudad: '',
        estado: '',
        codigoPostal: '',
        pais: ''
      }
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesRes, proyectosRes] = await Promise.all([
          api.get('/clientes'),
          api.get('/proyectos')
        ]);
        setClientes(clientesRes.data.data);
        setProyectos(proyectosRes.data.data);
      } catch (err) {
        setError('Error al cargar los datos necesarios');
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setFormData({ ...formData, items: newItems });
  };

  const agregarItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          descripcion: '',
          cantidad: 1,
          precioUnitario: 0,
          impuesto: 0
        }
      ]
    });
  };

  const eliminarItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validar campos requeridos
    if (!formData.cliente || !formData.proyecto || !formData.fechaVencimiento) {
      setError('Por favor complete todos los campos requeridos');
      setLoading(false);
      return;
    }

    // Validar items
    if (!formData.items.length || !formData.items.every(item => 
      item.descripcion && item.cantidad > 0 && item.precioUnitario >= 0)) {
      setError('Por favor complete correctamente todos los items');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/facturas', formData);

      if (response.data.success) {
        navigate('/facturas');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la factura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Nueva Factura</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cliente y Proyecto */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente *</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.cliente}
              onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
              required
            >
              <option value="">Seleccionar Cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente._id} value={cliente._id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Proyecto *</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.proyecto}
              onChange={(e) => setFormData({ ...formData, proyecto: e.target.value })}
              required
            >
              <option value="">Seleccionar Proyecto</option>
              {proyectos.map((proyecto) => (
                <option key={proyecto._id} value={proyecto._id}>
                  {proyecto.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Fechas */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Emisión</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.fechaEmision}
              onChange={(e) => setFormData({ ...formData, fechaEmision: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento *</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.fechaVencimiento}
              onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Items *</h3>
            <button
              type="button"
              onClick={agregarItem}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Agregar Item
            </button>
          </div>

          {formData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Descripción *</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={item.descripcion}
                  onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={item.cantidad}
                  onChange={(e) => handleItemChange(index, 'cantidad', parseFloat(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Precio Unitario *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={item.precioUnitario}
                  onChange={(e) => handleItemChange(index, 'precioUnitario', parseFloat(e.target.value))}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">
                  Subtotal: ${(item.cantidad * item.precioUnitario).toFixed(2)}
                </div>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Método de Pago y Moneda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Método de Pago *</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.metodoPago}
              onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
              required
            >
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="cheque">Cheque</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Moneda</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.moneda}
              onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
              required
            >
              <option value="MXN">MXN - Peso Mexicano</option>
              <option value="USD">USD - Dólar Estadounidense</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Notas</label>
          <textarea
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            maxLength="500"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/facturas')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {loading ? 'Guardando...' : 'Guardar Factura'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevaFactura;
