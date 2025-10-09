import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/header.jsx';
import { getAtendimentos } from '../../Services/api';

const AtendimentosPage = () => {
  const [atendimentos, setAtendimentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userId = localStorage.getItem('userId');
  const userRole = (localStorage.getItem('userRole') || '').toLowerCase();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getAtendimentos();
        const list = res && res.data ? res.data : res;
        let filtered = Array.isArray(list) ? list : [];
        if (userRole === 'cliente') filtered = filtered.filter(a => String(a.id_usuario) === String(userId));
        setAtendimentos(filtered);
      } catch {
        setError('Erro ao carregar atendimentos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, userRole]);

  return (
    <div>
      <Header />
      <div className="page-container">
        <h2>Atendimentos</h2>
        {loading && <div>Carregando...</div>}
        {error && <div className="error-text">{error}</div>}
        <ul>
          {atendimentos.map(a => (
            <li key={a.id} className="list-item">
              <strong>{new Date(a.data_atendimento || a.datachamado || Date.now()).toLocaleString()}</strong>
              {' - '}{a.descricao || a.prescricao || ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AtendimentosPage;
