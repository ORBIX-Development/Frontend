import React from "react";
import { useNavigate } from 'react-router-dom';

const MedConsultas = () => {
    const navigate = useNavigate();
    return (
        <button className="Btn" onClick={() => navigate('/medconsultas')}>
            Consultas
        </button>
    );
}

export default MedConsultas;