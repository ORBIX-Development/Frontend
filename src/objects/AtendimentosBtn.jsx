import React from 'react';
import { useNavigate } from 'react-router-dom';

const AtendimentosBtn = () => {
  const navigate = useNavigate();
  return (<button className="Btn" onClick={() => navigate('/atendimentos')}>Atendimentos</button>);
};

export default AtendimentosBtn;
