import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

const DetalleFactura = () => {
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const obtenerFactura = async () => {
      try {
        const response = await api.get(`/facturas/${id}`);
        setFactura(response.data.data);
      } catch (error) {
        console.error('Error al obtener la factura:', error);
        setError('Error al cargar los detalles de la factura');
      } finally {
        setLoading(false);
      }
    };

    obtenerFactura();
  }, [id]);

  const descargarPDF = async () => {
    try {
      const response = await api.get(`/facturas/${id}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      setError('Error al descargar el PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!factura) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-800">Factura no encontrada</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Factura #{factura.numero}</h1>
            <p className="text-gray-600">
              Fecha de emisión: {new Date(factura.fechaEmision).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={descargarPDF}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Descargar PDF
          </button>
        </div>

        {/* Información del Cliente y Proyecto */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Cliente</h3>
            {factura.cliente && (
              <div>
                <p className="text-gray-600">{factura.cliente.nombre}</p>
                <p className="text-gray-600">{factura.cliente.email}</p>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Proyecto</h3>
            {factura.proyecto && (
              <p className="text-gray-600">{factura.proyecto.nombre}</p>
            )}
          </div>
        </div>

        {/* Estado y Fechas */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Estado</h3>
            <p className={`mt-1 font-semibold ${
              factura.estado === 'pagada' ? 'text-green-600' :
              factura.estado === 'vencida' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {factura.estado.charAt(0).toUpperCase() + factura.estado.slice(1)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Fecha de Emisión</h3>
            <p className="mt-1">{new Date(factura.fechaEmision).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Fecha de Vencimiento</h3>
            <p className="mt-1">{new Date(factura.fechaVencimiento).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Items */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Unitario
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {factura.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {item.cantidad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ${item.precioUnitario.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ${item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totales */}
        <div className="border-t pt-6">
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${factura.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">IVA (16%):</span>
                <span className="font-medium">${factura.impuestos.iva.toFixed(2)}</span>
              </div>
              {factura.impuestos.otros > 0 && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Otros Impuestos:</span>
                  <span className="font-medium">${factura.impuestos.otros.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${factura.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="mt-8 grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Método de Pago</h3>
            <p className="text-gray-600">
              {factura.metodoPago.charAt(0).toUpperCase() + factura.metodoPago.slice(1)}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Moneda</h3>
            <p className="text-gray-600">{factura.moneda}</p>
          </div>
        </div>

        {/* Notas */}
        {factura.notas && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Notas</h3>
            <p className="text-gray-600">{factura.notas}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleFactura;
