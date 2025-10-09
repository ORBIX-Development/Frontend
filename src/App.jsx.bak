import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginRegister from './pages/Log/LoginRegister';
import Home from './pages/Home/home';
import Perfil from './pages/Perfil/Perfil';
import Consultas from './pages/Consultas/Consultas';
import MedConsultas from './pages/MedConsultas/MedConsultas';
import GerenConsultas from './pages/GerenConsultas/GerenConsultas';
import GerenUser from './pages/GerenUser/GerenUser';

// componente de rota protegida
const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  return element;
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginRegister />} />
      <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
      <Route path="/perfil" element={<ProtectedRoute element={<Perfil />} />} />
      <Route path="/perfil/:id" element={<ProtectedRoute element={<Perfil />} />} />
      <Route path="/consultas" element={<ProtectedRoute element={<Consultas />} />} />
      <Route path="/medconsultas" element={<ProtectedRoute element={<MedConsultas />} />} />
      <Route path="/gerenconsultas" element={<ProtectedRoute element={<GerenConsultas />} />} />
      <Route path="/gerenuser" element={<ProtectedRoute element={<GerenUser />} />} />
    </Routes>
  </BrowserRouter>
);

export default App;
