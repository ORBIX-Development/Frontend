import React from "react";
import { useNavigate } from 'react-router-dom';

const GerenciarUserBtn = () => {
  const navigate = useNavigate();
  return (
    <button className="Btn" onClick={() => navigate('/gerenuser')}>Gerenciar Usuário</button>
  );
}

export default GerenciarUserBtn;