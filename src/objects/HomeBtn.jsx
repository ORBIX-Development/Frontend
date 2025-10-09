import React from "react";

// criando o componente HomeBtn
import { useNavigate } from 'react-router-dom';

const HomeBtn = () => {
  const navigate = useNavigate();
  return (
    <button className="Btn" onClick={() => navigate('/Home')}>Inicio</button>
  );
}

export default HomeBtn;