import React, { useEffect, useState, useMemo } from "react";
import Header from '../../Components/Header/header.jsx';
import Modal from '../../Components/Modal/Modal.jsx';
import useToast from '../../Components/Toast/useToast.js';
import usePagination from '../../hooks/usePagination';
import { getMedConsultasById, getUsuarioById, updateConsulta, createReceita, getReceitas, updateReceita} from '../../Services/api';
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
    const [pageSize, setPageSize] = useState(10);

    // modal para observação ao finalizar
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [currentConsulta, setCurrentConsulta] = useState(null);
    const [observation, setObservation] = useState('');
    const [prescription, setPrescription] = useState('');
    // novos campos solicitados
    const [farmaco, setFarmaco] = useState('');
    const [dosagem, setDosagem] = useState('');
    const [duracao, setDuracao] = useState('');
    const [instrucao, setInstrucao] = useState('');
    const [editingRecipe, setEditingRecipe] = useState(false);
    const [editingReceitaId, setEditingReceitaId] = useState(null);
    const [actionMsg, setActionMsg] = useState('');

    // Tenta pegar o id do médico de várias chaves possíveis
    const userId = localStorage.getItem('userId') || localStorage.getItem('id') || localStorage.getItem('user_id') || localStorage.getItem('medico_id');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                if (!userId) {
                    setError('Usuário não identificado');
                    setConsultas([]);
                } else {
                    // Use API endpoint that returns consultas for a doctor directly
                    const res = await getMedConsultasById(userId);
                    const list = res && res.data ? res.data : res;
                    const my = Array.isArray(list) ? list : (list ? [list] : []);
                    setConsultas(my);

                    const clientIds = Array.from(new Set(my.map(c => c.id_cliente).filter(Boolean)));
                    const map = {};
                    await Promise.all(clientIds.map(async (cid) => {
                        const r = await getUsuarioById(cid);
                        if (r && r.data && r.data.nome) map[cid] = r.data.nome;
                    }));
                    setClientesMap(map);
                }
            } catch {
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
            if (startDate) {
                const d = new Date(c.data_consulta);
                const s = new Date(startDate);
                if (d < s) return false;
            }
            if (endDate) {
                const d = new Date(c.data_consulta);
                const e = new Date(endDate);
                // include whole day for endDate
                e.setHours(23,59,59,999);
                if (d > e) return false;
            }
            return true;
        });
    /* eslint-disable react-hooks/exhaustive-deps */
    }, [consultas, filterStatus, startDate, endDate, clientesMap]);
    /* eslint-enable react-hooks/exhaustive-deps */

    const { paginated, totalPages } = usePagination(filtered, page, pageSize);
    useEffect(() => { if (page > totalPages) setPage(1); }, [filtered, pageSize, totalPages, page]);

    const toast = useToast();

    const openCompleteModal = (consulta) => {
        setCurrentConsulta(consulta);
        setObservation('');
        setPrescription('');
        setFarmaco('');
        setDosagem('');
        setDuracao('');
        setInstrucao('');
        setEditingRecipe(false);
        setEditingReceitaId(null);
        setActionMsg('');
        setShowCompleteModal(true);
    };

    const openEditReceitaModal = async (consulta) => {
        setCurrentConsulta(consulta);
        // try to load existing receita for this consulta
        setActionMsg('');
        setFarmaco(''); setDosagem(''); setDuracao(''); setInstrucao('');
        setEditingReceitaId(null);
        setEditingRecipe(true);
        try {
            const r = await getReceitas();
            const list = r && r.data ? r.data : r;
            const found = Array.isArray(list) ? list.find(x => Number(x.id_consulta) === Number(consulta.id)) : null;
            if (found) {
                setFarmaco(found.farmaco || '');
                setDosagem(found.dosagem || '');
                setDuracao(found.duracao || '');
                setInstrucao(found.instrucao || '');
                setEditingReceitaId(found.id || found.id_receita || null);
            }
        } catch {
            // ignore
        }
        setShowCompleteModal(true);
    };

    const handleConfirmRealizada = async () => {
        if (!currentConsulta) return;
        setActionMsg('');
        try {
            // If editing an existing recipe, update it; otherwise if not editing, mark consulta as realizada and create recipe
            const receitaPayload = {
                farmaco: farmaco || '',
                dosagem: dosagem || '',
                duracao: duracao || '',
                instrucao: instrucao || '',
                id_medico: Number(userId) || Number(currentConsulta.id_medico),
                id_consulta: Number(currentConsulta.id)
            };
            if (editingRecipe) {
                // update existing receita if id available, otherwise create new one
                setActionMsg('Salvando receita...');
                if (editingReceitaId) {
                    await updateReceita(editingReceitaId, receitaPayload);
                    toast.push({ type: 'success', title: 'Atualizado', message: 'Receita atualizada com sucesso.' });
                } else {
                    await createReceita(receitaPayload);
                    toast.push({ type: 'success', title: 'Criado', message: 'Receita criada com sucesso.' });
                }
                setShowCompleteModal(false);
            } else {
                // normal flow: mark consulta realizada and create receita
                await updateConsulta(currentConsulta.id, { status_consulta: 'realizada' });
                setActionMsg('Enviando receita...');
                await createReceita(receitaPayload);
                setConsultas(prev => prev.map(c => c.id === currentConsulta.id ? { ...c, status_consulta: 'realizada' } : c));
                setShowCompleteModal(false);
                toast.push({ type: 'success', title: 'Concluído', message: 'Consulta marcada como realizada e atendimento criado.' });
            }
        } catch (err) {
            // tentar extrair info do AxiosError
            const status = err && err.response && err.response.status;
            const respData = err && err.response && err.response.data;
            const msg = respData || err.message || 'Erro desconhecido';
            const userMsg = `Erro ao marcar como realizada: ${status ? `status ${status} - ` : ''}${typeof msg === 'string' ? msg : JSON.stringify(msg)}`;
            setActionMsg(userMsg);
            toast.push({ type: 'error', title: 'Erro', message: 'Não foi possível concluir. Veja detalhes na tela.' });
            // log detalhado para debug no console
            console.error('Erro ao marcar consulta como realizada (detalhe):', err);
            if (err && err.response) console.error('response.data =', err.response.data);
        }
    };

    const statusLabel = (s) => ({ nao_realizada: 'Não realizada', realizada: 'Realizada', cancelada: 'Cancelada' }[s] || s);

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
                            <option value="nao_realizada">Ainda não realizada</option>
                            <option value="realizada">Realizada</option>
                            <option value="cancelada">Cancelada</option>
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
                            <option value={4}>4</option>
                            <option value={8}>8</option>
                            <option value={16}>16</option>
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
                                                    <div className={`mc-badge ${c.status_consulta === 'realizada' ? 'done' : c.status_consulta === 'cancelada' ? 'cancel' : 'pending'}`}>{statusLabel(c.status_consulta)}</div>
                                                </div>
                                                <div className="mc-sub">{c.especialidade || 'Clínico Geral'}</div>
                                                <div className="mc-date">{new Date(c.data_consulta).toLocaleString()}</div>
                                            </div>
                                                <div className="mc-actions">
                                                {String(c.status_consulta).toLowerCase() !== 'realizada' ? (
                                                    <button className="Btn primary" onClick={() => openCompleteModal(c)}>Marcar como realizada</button>
                                                ) : (
                                                    <button className="Btn warning" onClick={() => openEditReceitaModal(c)}>Editar receita</button>
                                                )}
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