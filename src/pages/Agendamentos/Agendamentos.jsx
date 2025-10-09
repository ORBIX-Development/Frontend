import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/header.jsx';
import { getAgendamentos, deleteAgendamento } from '../../Services/api';

const AgendamentosPage = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');
  const userRole = (localStorage.getItem('userRole') || '').toLowerCase();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getAgendamentos();
        const list = res && res.data ? res.data : res;
        let filtered = Array.isArray(list) ? list : [];
        if (userRole === 'cliente') filtered = filtered.filter(a => String(a.id_usuario) === String(userId));
        setAgendamentos(filtered);
      } catch {
        setError('Erro ao carregar agendamentos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, userRole]);

  const handleCancel = async (id) => {
    try {
      await deleteAgendamento(id);
      setAgendamentos(prev => prev.filter(a => a.id !== id));
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <Header />
      <div className="page-container">
        <h2>Agendamentos</h2>
        {loading && <div>Carregando...</div>}
        {error && <div className="error-text">{error}</div>}
        <ul>
          {agendamentos.map(a => (
            <li key={a.id} className="list-item">
              <strong>{new Date(a.data_dia || Date.now()).toLocaleString()}</strong>
              {' - '}Solicitado por: {a.id_usuario}
              {userRole === 'cliente' && <button className="Btn ml-sm" onClick={() => handleCancel(a.id)}>Cancelar</button>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AgendamentosPage;
