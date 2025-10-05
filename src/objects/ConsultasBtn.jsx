import React from "react";
import { useNavigate } from 'react-router-dom';

const ConsultasBtn = () => {
  const navigate = useNavigate();
  return (
    <button className="Btn" onClick={() => navigate('/consultas')}>
        Minhas Consultas
    </button>
  );
}

export default ConsultasBtn;