import React from "react";
import { useNavigate } from 'react-router-dom';

const PerfilBtn = () => {
  const navigate = useNavigate();
  return (
    <button className="Btn" onClick={() => navigate('/perfil')}>Perfil</button>
  );
}

export default PerfilBtn;