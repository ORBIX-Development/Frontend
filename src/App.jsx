import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginRegister from './pages/Log/LoginRegister';
import Home from './pages/Home/home';
import Perfil from './pages/Perfil/Perfil';
import Consultas from './pages/Consultas/Consultas';
import MedConsultas from './pages/MedConsultas/MedConsultas';
import GerenConsultas from './pages/GerenConsultas/GerenConsultas';
import GerenUser from './pages/GerenUser/GerenUser';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<LoginRegister />} />
-      <Route path='/home' element={<Home />} />
  <Route path='/perfil' element={<Perfil />} />
  <Route path='/perfil/:id' element={<Perfil />} />
      <Route path='/consultas' element={<Consultas />} />
      <Route path='/medconsultas' element={<MedConsultas />} />
      <Route path='/gerenconsultas' element={<GerenConsultas />} />
      <Route path='/gerenuser' element={<GerenUser />} />
    </Routes>
  </BrowserRouter>
);

export default App;
