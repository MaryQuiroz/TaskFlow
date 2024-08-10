import { Routes, Route } from 'react-router-dom';
import Facturas from './Facturas';
import NuevaFactura from './NuevaFactura';
import DetalleFactura from './DetalleFactura';

const FacturasRoutes = () => {
  return (
    <Routes>
      <Route index element={<Facturas />} />
      <Route path="nueva" element={<NuevaFactura />} />
      <Route path=":id" element={<DetalleFactura />} />
    </Routes>
  );
};

export default FacturasRoutes;
