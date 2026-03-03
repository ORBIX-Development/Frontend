import React, { useEffect, useState, useMemo } from "react";
import Header from '../../components/Header/header.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import useToast from '../../components/Toast/useToast.js';
import usePagination from '../../hooks/usePagination';
import { getMedConsultasById, getUsuarioById, updateConsulta, createReceita, getReceitas, updateReceita } from '../../Services/api';
import './MedConsultas.css';

const PageConsultaMedico = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientesMap, setClientesMap] = useState({});
  const [filterStatus, setFilterStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [currentConsulta, setCurrentConsulta] = useState(null);
  const [observation, setObservation] = useState('');
  const [prescription, setPrescription] = useState('');
  const [farmaco, setFarmaco] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [duracao, setDuracao] = useState('');
  const [instrucao, setInstrucao] = useState('');
  const [editingRecipe, setEditingRecipe] = useState(false);
  const [editingReceitaId, setEditingReceitaId] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  const userId =
    localStorage.getItem('userId') ||
    localStorage.getItem('id') ||
    localStorage.getItem('user_id') ||
    localStorage.getItem('medico_id');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        if (!userId) {
          setError('Usuário não identificado');
          setConsultas([]);
        } else {
          const res = await getMedConsultasById(userId);
          const list = res?.data ?? res;
          const my = Array.isArray(list) ? list : list ? [list] : [];
          setConsultas(my);

          const clientIds = [...new Set(my.map(c => c.id_cliente).filter(Boolean))];
          const map = {};
          await Promise.all(
            clientIds.map(async cid => {
              const r = await getUsuarioById(cid);
              if (r?.data?.nome) map[cid] = r.data.nome;
            })
          );
          setClientesMap(map);
        }
      } catch (e) {
        console.error('Erro ao carregar consultas:', e);
        setError('Erro ao carregar consultas');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  const filtered = useMemo(() => {
    return (consultas || []).filter(c => {
      if (filterStatus && c.status_consulta !== filterStatus) return false;
      if (startDate && new Date(c.data_consulta) < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(c.data_consulta) > end) return false;
      }
      return true;
    });
  }, [consultas, filterStatus, startDate, endDate]);

  const { paginated, totalPages } = usePagination(filtered, page, pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [filtered, pageSize, totalPages, page]);

  const toast = useToast();

  const resetFields = () => {
    setObservation('');
    setPrescription('');
    setFarmaco('');
    setDosagem('');
    setDuracao('');
    setInstrucao('');
    setEditingRecipe(false);
    setEditingReceitaId(null);
    setActionMsg('');
  };

  const openCompleteModal = consulta => {
    setCurrentConsulta(consulta);
    resetFields();
    setShowCompleteModal(true);
  };

  const openEditReceitaModal = async consulta => {
    setCurrentConsulta(consulta);
    resetFields();
    setEditingRecipe(true);

    try {
      const r = await getReceitas();
      const list = r?.data ?? r;
      const consultaId = consulta.id_consulta || consulta.id;
      const found = Array.isArray(list)
        ? list.find(x => Number(x.id_consulta) === Number(consultaId))
        : null;

      if (found) {
        setFarmaco(found.farmaco || '');
        setDosagem(found.dosagem || '');
        setDuracao(found.duracao || '');
        setInstrucao(found.instrucao || '');
        setEditingReceitaId(found.id || found.id_receita);
      }
    } catch (e) {
      console.error('Erro ao carregar receitas:', e);
    }

    setShowCompleteModal(true);
  };

  const handleConfirmRealizada = async () => {
    if (!currentConsulta) return;
    setActionMsg('');

    console.log('DEBUG currentConsulta em handleConfirmRealizada:', currentConsulta);

    const rawConsultaId = currentConsulta.id_consulta || currentConsulta.id;

    const receitaPayload = {
      farmaco: farmaco || '',
      dosagem: dosagem || '',
      duracao: duracao || '',
      instrucao: instrucao || '',
      id_medico: Number(userId) || Number(currentConsulta.id_medico),
      id_consulta: rawConsultaId
    };

    console.log('DEBUG receitaPayload em handleConfirmRealizada:', receitaPayload);

    try {
      if (editingRecipe) {
        setActionMsg('Salvando receita...');
        if (editingReceitaId) {
          await updateReceita(editingReceitaId, receitaPayload);
          toast.push({ type: 'success', title: 'Atualizado', message: 'Receita atualizada com sucesso.' });
        } else {
          await createReceita(receitaPayload);
          toast.push({ type: 'success', title: 'Criado', message: 'Receita criada com sucesso.' });
        }
        setShowCompleteModal(false);
        return;
      }

      // fluxo padrão: marcar consulta como realizada e criar receita
      await updateConsulta(rawConsultaId, { status_consulta: 'REALIZADA' });
      setActionMsg('Enviando receita...');
      await createReceita(receitaPayload);

      setConsultas(prev =>
        prev.map(c => {
          const cid = c.id_consulta || c.id;
          return cid === rawConsultaId ? { ...c, status_consulta: 'REALIZADA' } : c;
        })
      );
      setShowCompleteModal(false);
      toast.push({ type: 'success', title: 'Concluído', message: 'Consulta marcada como realizada e atendimento criado.' });
    } catch (err) {
      const status = err?.response?.status;
      const respData = err?.response?.data;
      const msg = respData || err.message || 'Erro desconhecido';
      const userMsg = `Erro ao marcar como realizada: ${status ? `status ${status} - ` : ''}${typeof msg === 'string' ? msg : JSON.stringify(msg)}`;
      setActionMsg(userMsg);
      toast.push({ type: 'error', title: 'Erro', message: 'Não foi possível concluir. Veja detalhes na tela.' });
      console.error('Erro ao marcar consulta como realizada (detalhe):', err);
      if (err?.response) console.error('response.data =', err.response.data);
    }
  };

  const statusLabel = s => {
    const norm = String(s || '').toUpperCase();
    const map = {
      'NAO-REALIZADA': 'Ainda Não Realizada',
      'REALIZADA': 'Realizada',
      // 'CANCELADA': 'Cancelada'
    };
    return map[norm] || s;
  };

  return (
    <div>
      <Header />

      <div className="med-page">
        <div className="page-card page-container">
          <h2>Minhas consultas</h2>

          {loading && <div>Carregando...</div>}
          {error && <div className="error-text">{error}</div>}

          {/* filtros: situação e intervalo de data */}
          <div className="sticky-filter filter-row mc-filter-row">
            <label>
              Situação:
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="ml-xs">
                <option value="">Todas</option>
                <option value="NAO-REALIZADA">Ainda não realizada</option>
                <option value="REALIZADA">Realizada</option>
                {/* <option value="CANCELADA">Cancelada</option> */}
              </select>
            </label>

            <label>
              De:
              <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }} className="ml-xs" />
            </label>

            <label>
              Até:
              <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }} className="ml-xs" />
            </label>

            <label className="ml-sm ml-auto">
              Linhas:
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="ml-xs">
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={18}>18</option>
              </select>
            </label>
          </div>

          <div className="mcards">
            {paginated.length === 0 && <div className="empty-list">Nenhuma consulta encontrada.</div>}

            {paginated.map(c => (
              <div key={c.id} className="mc-card">
                <div className="mc-left">
                  <div className="mc-avatar">{(clientesMap[c.id_cliente] || '').charAt(0) || 'U'}</div>
                </div>

                <div className="mc-body">
                  <div className="mc-top">
                    <div className="mc-title">{clientesMap[c.id_cliente] || `Paciente (${c.nome})`}</div>
                    {(() => {
                      const normStatus = String(c.status_consulta || '').toUpperCase();
                      const badgeClass = normStatus === 'REALIZADA'
                        ? 'done'
                        : normStatus === 'CANCELADA'
                        ? 'cancel'
                        : 'pending';
                      return (
                        <div className={`mc-badge ${badgeClass}`}>{statusLabel(c.status_consulta)}</div>
                      );
                    })()}
                  </div>

                  <div className="mc-sub">{''}</div>
                  <div className="mc-date">{new Date(c.data_consulta).toLocaleString()}</div>
                </div>

                <div className="mc-actions">
                  {(() => {
                    const normStatus = String(c.status_consulta || '').toUpperCase();
                    const isRealizada = normStatus === 'REALIZADA';
                    return !isRealizada ? (
                      <button className="Btn primary" onClick={() => openCompleteModal(c)}>Marcar como realizada</button>
                    ) : (
                      <button className="Btn warning" onClick={() => openEditReceitaModal(c)}>Editar receita</button>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>

          {/* paginação */}
          <div className="pagination-row med-pagination-row">
            <div>
              Página {page} de {totalPages}
            </div>

            <div className="filter-row">
              <button className="Btn" onClick={() => setPage(1)} disabled={page === 1}>Primeira</button>
              <button className="Btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
              <button className="Btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Próxima</button>
              <button className="Btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Última</button>
            </div>
          </div>

          {/* modal reutilizável */}
          {showCompleteModal && (
            <Modal onClose={() => { setShowCompleteModal(false); setCurrentConsulta(null); }}>
              <h3>Finalizar consulta</h3>

              <div className="mb-sm"><strong>Data da consulta:</strong> {currentConsulta ? new Date(currentConsulta.data_consulta).toLocaleString() : ''}</div>

              <div className="mb-sm modal-form-grid">
                <div className="form-block">
                  <label>Observação (o que aconteceu)</label>
                  <textarea value={observation} onChange={e => setObservation(e.target.value)} rows={4} className="full-width" placeholder="Descreva o que foi feito ou observado durante a consulta" />
                </div>

                <div className="form-block">
                  <label>Prescrição (observação breve)</label>
                  <textarea value={prescription} onChange={e => setPrescription(e.target.value)} rows={3} className="full-width" placeholder="Resumo da prescrição" />
                </div>
              </div>

              <div className="mb-sm modal-form-grid">
                <div className="form-block">
                  <label>Fármaco</label>
                  <input value={farmaco} onChange={e => setFarmaco(e.target.value)} className="full-width" placeholder="Nome do medicamento" />
                </div>

                <div className="form-block">
                  <label>Dosagem</label>
                  <input value={dosagem} onChange={e => setDosagem(e.target.value)} className="full-width" placeholder="Ex.: 500mg" />
                </div>
              </div>

              <div className="mb-sm modal-form-grid">
                <div className="form-block">
                  <label>Duração</label>
                  <input value={duracao} onChange={e => setDuracao(e.target.value)} className="full-width" placeholder="Ex.: 7 dias" />
                </div>

                <div className="form-block">
                  <label>Instrução</label>
                  <input value={instrucao} onChange={e => setInstrucao(e.target.value)} className="full-width" placeholder="Ex.: tomar após as refeições" />
                </div>
              </div>

              {actionMsg && <div className="error-text mb-sm">{actionMsg}</div>}

              <div className="actions-row">
                <button className="modal-btn secondary" onClick={() => { setShowCompleteModal(false); setCurrentConsulta(null); }}>Fechar</button>
                <button className="modal-btn primary" onClick={handleConfirmRealizada}>Salvar e encerrar</button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageConsultaMedico;
