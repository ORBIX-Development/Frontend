import React from "react";
import { useNavigate } from 'react-router-dom';

const GerenConsulta = () => {
  const navigate = useNavigate();
  return (
    <button className="Btn" onClick={() => navigate('/gerenconsultas')}>Gerenciar Consultas</button>
  );
};

export default GerenConsulta;
