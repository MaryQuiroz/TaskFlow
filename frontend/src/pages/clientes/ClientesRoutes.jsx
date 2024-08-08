import { Routes, Route, Navigate } from 'react-router-dom';
import Clientes from './Clientes';
import NuevoCliente from './NuevoCliente';

export default function ClientesRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Clientes />} />
      <Route path="/nuevo" element={<NuevoCliente />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
