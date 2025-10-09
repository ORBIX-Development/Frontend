import React from 'react';
import { useNavigate } from 'react-router-dom';

const AgendamentosBtn = () => {
  const navigate = useNavigate();
  return (<button className="Btn" onClick={() => navigate('/agendamentos')}>Agendamentos</button>);
};

export default AgendamentosBtn;
