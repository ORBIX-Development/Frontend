import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/header.jsx';
import { getAgendamentos, deleteAgendamento, createAgendamento, getAgendamentoByIdCliente } from '../../Services/api';
import Modal from '../../components/Modal/Modal.jsx';
// import useToast from '../../components/Toast/useToast.js';
import './Agendamentos.css';

const AgendamentosPage = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId') || localStorage.getItem('id') || localStorage.getItem('user_id');
  const userRole = (localStorage.getItem('userRole') || '').toLowerCase();


  // create modal
  const [showCreate, setShowCreate] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [descricao, setDescricao] = useState('');
  // center notice (replaces old inline confirmation)
  const [centerNotice, setCenterNotice] = useState({ show: false, title: '', message: '', variant: 'success' });
  // validation popup for incorrect fields
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidation, setShowValidation] = useState(false);
  const [creating, setCreating] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
          let list = [];
          if (userRole === 'cliente' && userId) {
            // prefer dedicated endpoint for client's agendamentos
            const res = await getAgendamentoByIdCliente(userId);
            const body = res && res.data ? res.data : res;
            // backend may return a single object or array
            if (Array.isArray(body)) list = body;
            else if (body) list = [body];
          } else {
            const res = await getAgendamentos();
            list = res && res.data ? res.data : res;
          }
          const filtered = Array.isArray(list) ? list : [];
          setAgendamentos(filtered);
        } catch (e) {
        setError('Erro ao carregar agendamentos');
          console.error('Erro getAgendamentos', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, userRole]);

  const handleCancel = async (id) => {
    // If this is a temporary optimistic id, don't call the backend — just remove locally
    if (typeof id === 'string' && id.startsWith('temp_')) {
      setAgendamentos(prev => prev.filter(a => a.id !== id));
      setCenterNotice({ show: true, title: 'Cancelado', message: 'Agendamento cancelado.', variant: 'success' });
      setTimeout(() => setCenterNotice(prev => ({ ...prev, show: false })), 1400);
      return;
    }

    try {
      setCancelingId(id);
      await deleteAgendamento(id);
      setAgendamentos(prev => prev.filter(a => a.id !== id));
      // show centered success notice
      setCenterNotice({ show: true, title: 'Cancelado', message: 'Agendamento cancelado.', variant: 'success' });
      setTimeout(() => setCenterNotice(prev => ({ ...prev, show: false })), 2000);
    } catch (err) {
      console.error('Erro cancelamento', err);
      // show centered error notice
      setCenterNotice({ show: true, title: 'Erro', message: 'Não foi possível cancelar.', variant: 'error' });
      // also log/keep toast if desired
      // toast.push({ type: 'error', title: 'Erro', message: 'Não foi possível cancelar.' });
      setTimeout(() => setCenterNotice(prev => ({ ...prev, show: false })), 2200);
    } finally {
      setCancelingId(null);
    }
  };
  const handleCreate = async () => {
    // client-side validation
    const errors = [];
    if (!date || !time) errors.push('Data e hora obrigatórias');
    const datetime = `${date} ${time}:00`;
    const parsed = Date.parse(datetime);
    if (isNaN(parsed)) errors.push('Data/Hora inválida');
    else if (new Date(parsed) < new Date()) errors.push('Data/Hora não pode ser no passado');
    if (descricao && descricao.length > 500) errors.push('Descrição muito longa (máx 500 caracteres)');
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidation(true);
      return;
    }

    // optimistic insert with temporary id
    const tempId = `temp_${Date.now()}`;
    const newItem = {
      id: tempId,
      data_dia: datetime,
      descricao: descricao || 'Check-Up',
      id_cliente: Number(userId),
      // keep UI compatibility
      status: 'pendente',
      status_agendamento: 'pendente'
    };
    setAgendamentos(prev => [newItem, ...(prev || [])]);
    setShowCreate(false);
    // show centered notice immediately
    setCenterNotice({ show: true, title: 'Solicitado', message: 'Agendamento solicitado.', variant: 'success' });
    setCreating(true);
    try {
      const resCreate = await createAgendamento({ data_dia: datetime, descricao: descricao || 'Check-Up', id_cliente: Number(userId), status: 'PENDENTE' });
      // try to extract insert id from response
      const insertId = resCreate && resCreate.data && (resCreate.data.insertId || resCreate.data.id) ? (resCreate.data.insertId || resCreate.data.id) : null;
      if (insertId) {
        setAgendamentos(prev => prev.map(a => a.id === tempId ? { ...a, id: insertId } : a));
      }
    } catch (err) {
      console.error('Erro createAgendamento', err);
      // detect server-side validation messages if any
      const serverErrors = [];
      if (err && err.response && err.response.data) {
        const d = err.response.data;
        if (d.errors && Array.isArray(d.errors)) d.errors.forEach(e => serverErrors.push(e.msg || e.message || JSON.stringify(e)));
        else if (d.message) serverErrors.push(d.message);
      }
      // rollback optimistic insert
      setAgendamentos(prev => prev.filter(a => a.id !== tempId));
      if (serverErrors.length > 0) {
        setValidationErrors(serverErrors);
        setShowValidation(true);
        setCenterNotice({ show: true, title: 'Erro', message: 'Dados incorretos.', variant: 'error' });
      } else {
        setCenterNotice({ show: true, title: 'Erro', message: 'Não foi possível criar agendamento.', variant: 'error' });
      }
    } finally {
      setCreating(false);
      setTimeout(() => setCenterNotice(prev => ({ ...prev, show: false })), 1800);
    }
  };

  return (
    <div>
      <Header />
      <div className="med-page">
        <div className="page-card page-container">
          <div className="ag-header">
            <h2>Agendamentos</h2>
            {userRole === 'cliente' && (
              <button className="Btn primary" onClick={() => setShowCreate(true)}>Criar agendamento</button>
            )}
          </div>
        {loading && <div>Carregando...</div>}
        {error && <div className="error-text">{error}</div>}
        {/* center notice (success / error) */}
        {centerNotice.show && (
          <div className="center-notice-root">
            <div className={`center-notice ${centerNotice.variant === 'error' ? 'error' : 'success'}`}>
              <div className="center-notice-title">{centerNotice.title}</div>
              <div className="center-notice-sub">{centerNotice.message}</div>
            </div>
          </div>
        )}

        {/* validation popup listing incorrect fields */}
        {showValidation && (
          <div className="center-notice-root">
            <div className="validation-popup">
              <h3>Dados incorretos</h3>
              <ul>
                {validationErrors.map((err, idx) => <li key={idx}>{err}</li>)}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button className="modal-btn primary" onClick={() => setShowValidation(false)}>Fechar</button>
              </div>
            </div>
          </div>
        )}

        {agendamentos.length === 0 ? (
          <div className="empty-list">Você não tem agendamentos.</div>
        ) : (
          <div className="consultas-grid">
            {agendamentos.map(a => (
              <div key={a.id} className="ag-card">
                <div className="consulta-info">
                  <p className="consulta-data">
                    {new Date(a.data_dia || Date.now()).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="consulta-especialidade">{a.descricao || 'Agendamento'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: 6 }}>
                    <small className={`badge ${((a.status_agendamento || a.status || 'pendente').toLowerCase())}`}>
                      {(a.status_agendamento || a.status || 'pendente')}
                    </small>
                  </div>
                  {userRole === 'cliente' && (
                    <button className="Btn ml-sm" onClick={() => handleCancel(a.id)} disabled={cancelingId === a.id}>
                      {cancelingId === a.id ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {showCreate && (
          <Modal onClose={() => setShowCreate(false)}>
            <h3 className="modal-title">Criar agendamento</h3>
            <div className="modal-form-grid">
              <div className="form-block">
                <label>Data</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="full-width" />
              </div>
              <div className="form-block">
                <label>Hora</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="full-width" />
              </div>
            </div>
            <div className="modal-form-grid">
              <div className="form-block">
                <label>Descrição</label>
                <input value={descricao} onChange={e => setDescricao(e.target.value)} className="full-width" />
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={() => setShowCreate(false)} disabled={creating}>Fechar</button>
              <button className="modal-btn primary" onClick={handleCreate} disabled={creating}>{creating ? 'Enviando...' : 'Solicitar'}</button>
            </div>
          </Modal>
        )}
        </div>
      </div>
    </div>
  );
};

export default AgendamentosPage;
