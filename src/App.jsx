import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './global.css';
import LoginRegister from './Pages/Log/LoginRegister';
import Landing from './Pages/Landing/Landing';
import Home from './Pages/Home/home';
import Perfil from './Pages/Perfil/Perfil';
import Consultas from './Pages/Consultas/Consultas';
import MedConsultas from './Pages/MedConsultas/MedConsultas';
import GerenConsultas from './Pages/GerenConsultas/GerenConsultas';
import GerenUser from './Pages/GerenUser/GerenUser';
import Atendimentos from './Pages/Atendimentos/Atendimentos';
import Agendamentos from './Pages/Agendamentos/Agendamentos';

// rota protegida por token e (opcional) por cargo
const ProtectedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  if (allowedRoles && allowedRoles.length > 0) {
    const role = (localStorage.getItem('userRole') || '').toLowerCase();
    const ok = allowedRoles.map(r => String(r).toLowerCase()).includes(role);
    if (!ok) return <Navigate to="/home" replace />;
  }
  return element;
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<LoginRegister />} />
      <Route path="/home" element={<ProtectedRoute element={<Home />} />} />

      {/* Perfil disponível para usuários autenticados (qualquer cargo) */}
      <Route path="/perfil" element={<ProtectedRoute element={<Perfil />} allowedRoles={['cliente','medico','secretaria','admin']} />} />
      <Route path="/perfil/:id" element={<ProtectedRoute element={<Perfil />} allowedRoles={['cliente','medico','secretaria','admin']} />} />

      {/* Rotas por cargo */}
      <Route path="/consultas" element={<ProtectedRoute element={<Consultas />} allowedRoles={['cliente']} />} />
      <Route path="/medconsultas" element={<ProtectedRoute element={<MedConsultas />} allowedRoles={['medico']} />} />
      <Route path="/gerenconsultas" element={<ProtectedRoute element={<GerenConsultas />} allowedRoles={['secretaria']} />} />
      <Route path="/gerenuser" element={<ProtectedRoute element={<GerenUser />} allowedRoles={['admin']} />} />

      {/* Atendimentos (médico e cliente) */}
      <Route path="/atendimentos" element={<ProtectedRoute element={<Atendimentos />} allowedRoles={['medico','cliente']} />} />

      {/* Agendamentos (secretaria e cliente) */}
      <Route path="/agendamentos" element={<ProtectedRoute element={<Agendamentos />} allowedRoles={['secretaria','cliente']} />} />
    </Routes>
  </BrowserRouter>
);

export default App;
