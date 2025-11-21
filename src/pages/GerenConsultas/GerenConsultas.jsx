import React, { useEffect, useState } from "react";
import Header from '../../components/Header/header.jsx';
import { getAgendamentos, deleteAgendamento, getUsuarios, createConsulta, getConsultasPendentes, getMedicos } from '../../Services/api';

import '../Consultas/Consulta.css';

const PageGerenConsultas = () => {
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [users, setUsers] = useState([]); // todos usuários (para map de nomes)
    const [medicos, setMedicos] = useState([]); // médicos vindos de getMedicos()

    // modais
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [currentSolicitacao, setCurrentSolicitacao] = useState(null);
    const [selectedMedico, setSelectedMedico] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createData, setCreateData] = useState('');
    const [createMedico, setCreateMedico] = useState('');
    const [createCliente, setCreateCliente] = useState('');
    const [actionMsg, setActionMsg] = useState('');

    const userRole = (localStorage.getItem('userRole') || '').toLowerCase();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const [agRes, uRes, cRes, mRes] = await Promise.all([
                    getAgendamentos(),
                    getUsuarios(),
                    getConsultasPendentes(),
                    getMedicos()
                ]);
                const ag = agRes && agRes.data ? agRes.data : agRes;
                const us = uRes && uRes.data ? uRes.data : uRes;
                const cs = cRes && cRes.data ? cRes.data : cRes;
                const ms = mRes && mRes.data ? mRes.data : mRes;

                setSolicitacoes(Array.isArray(ag) ? ag : []);
                setUsers(Array.isArray(us) ? us : []);
                setMedicos(Array.isArray(ms) ? ms : []);

                // show only consultas from today onwards
                const today = new Date();
                const upcoming = (Array.isArray(cs) ? cs : []).filter(c => new Date(c.data_consulta) >= new Date(today.toDateString()));
                setConsultas(upcoming);
            } catch {
                setError('Erro ao carregar dados');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const clientes = users.filter(u => u.cargo === 'cliente');

    const usersMap = React.useMemo(() => {
        const m = {};
        (users || []).forEach(u => { m[u.id] = { nome: u.nome, cod_doc: u.cod_doc }; });
        return m;
    }, [users]);

    const openAccept = (sol) => {
        setCurrentSolicitacao(sol);
        setSelectedMedico('');
        setActionMsg('');
        setShowAcceptModal(true);
    };

    const handleAccept = async (e) => {
        e.preventDefault();

        const medicoId = Number(selectedMedico);
        if (!medicoId) {
            setActionMsg('Escolha um médico');
            return;
        }

        try {
            const dataConsulta = normalizeDateForBackend(currentSolicitacao.data_dia);
            // criar consulta com dados da solicitação
            await createConsulta({
                status_consulta: 'NAO-REALIZADA',
                data_consulta: dataConsulta,
                id_medico: medicoId,
                id_cliente: currentSolicitacao.id_cliente
            });

            // remover a solicitação
            await deleteAgendamento(currentSolicitacao.id);
            setActionMsg('Solicitação aceita e consulta marcada');
            // atualizar listas localmente
            setSolicitacoes(solicitacoes.filter(s => s.id !== currentSolicitacao.id));
            // atualizar consultas: adicionar criada (simplificação: refetch seria ideal)
            const dataConsultaNorm = dataConsulta;
            setConsultas(prev => [
                ...prev,
                {
                    data_consulta: dataConsultaNorm,
                    status_consulta: 'NAO-REALIZADA',
                    id_medico: medicoId,
                    id_cliente: currentSolicitacao.id_cliente
                }
            ]);

            setShowAcceptModal(false);
        } catch {
            setActionMsg('Erro ao aceitar solicitação');
        }
    };

    const handleDeny = async (sol) => {
        try {
            await deleteAgendamento(sol.id);
            setSolicitacoes(solicitacoes.filter(s => s.id !== sol.id));
        } catch {
            // ignore
        }
    };

    const openCreate = () => {
        setCreateData('');
        setCreateMedico('');
        setCreateCliente('');
        setActionMsg('');
        setShowCreateModal(true);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!createData || !createMedico || !createCliente) {
            setActionMsg('Preencha data, médico e cliente');
            return;
        }
        try {
            const dataConsulta = normalizeDateForBackend(createData);
            await createConsulta({ status_consulta: 'nao_realizada', data_consulta: dataConsulta, id_medico: createMedico, id_cliente: createCliente });
            setActionMsg('Consulta marcada com sucesso');
            setConsultas(prev => [...prev, { data_consulta: dataConsulta, status_consulta: 'nao_realizada', id_medico: createMedico, id_cliente: createCliente }]);
            setShowCreateModal(false);
        } catch {
            setActionMsg('Erro ao marcar consulta');
        }
    };

    const statusMap = {
        nao_realizada: 'Não realizada',
        realizada: 'Realizada',
        cancelada: 'Cancelada'
    };

    const getStatusLabel = (rawStatus) => {
        const key = String(rawStatus || '').toLowerCase().replace('-', '_');
        return statusMap[key] || rawStatus || '';
    };

    const normalizeDateForBackend = (value) => {
        if (!value) return value;

        // se vier como Date, formatar manualmente
        if (value instanceof Date) {
            const pad = (n) => (n < 10 ? '0' + n : '' + n);
            const y = value.getFullYear();
            const m = pad(value.getMonth() + 1);
            const d = pad(value.getDate());
            const hh = pad(value.getHours());
            const mm = pad(value.getMinutes());
            const ss = pad(value.getSeconds());
            return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
        }

        let s = String(value);
        // remover sufixo Z se existir
        if (s.endsWith('Z')) s = s.slice(0, -1);
        // trocar T por espaço
        s = s.replace('T', ' ');
        // se vier sem segundos (ex: 2025-11-27 19:30), acrescentar :00
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(s)) {
            s = s + ':00';
        }
        return s;
    };

    // UI: apenas secretária deve usar essa página, mas permissões são simples aqui
    return (
        <div>
            <Header />
            <div className="med-page">
            <div className="page-container">
                <h2>Gerenciar Consultas</h2>
                {userRole !== 'secretaria' && <div>Atenção: esta tela é destinada à secretária.</div>}
{/* 
                <div className="mb-md">
                    <button className="Btn" onClick={openCreate}>Marcar nova consulta</button>
                </div> */}

                {actionMsg && <div className="mb-sm">{actionMsg}</div>}

                {loading && <div>Carregando...</div>}
                {error && <div className="error-text">{error}</div>}

                <section>
                    <h3>Solicitações</h3>
                    {solicitacoes.length === 0 ? (
                        <div>Não há solicitações.</div>
                    ) : (
                        <div className="consultas-grid">
                            {solicitacoes.map(s => (
                                <div key={s.id} className="consulta-card">
                                    <div className="consulta-info">
                                        <p className="consulta-data">
                                            {new Date(s.data_dia).toLocaleString()}
                                        </p>
                                        <p className="consulta-medico">
                                            Cliente: {usersMap[s.id_cliente]?.nome || s.id_cliente}
                                            {usersMap[s.id_cliente]?.cod_doc ? ` (${usersMap[s.id_cliente].cod_doc})` : ''}
                                        </p>
                                        {s.descricao && (
                                            <p className="consulta-especialidade">
                                                Observação: {s.descricao}
                                            </p>
                                        )}
                                    </div>
                                    <div className="actions-row">
                                        <button className="Btn-accept" onClick={() => openAccept(s)}>Aceitar</button>
                                        <button className="Btn-deny" onClick={() => handleDeny(s)}>Recusar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="mt-md">
                    <h3>Agenda (a partir de hoje)</h3>
                    {consultas.length === 0 ? (
                        <div>Nenhuma consulta agendada.</div>
                    ) : (
                        <div className="consultas-grid">
                            {consultas.map((c, idx) => (
                                <div key={c.id || idx} className="consulta-card">
                                    <div className="consulta-info">
                                        <p className="consulta-data">
                                            {new Date(c.data_consulta).toLocaleString()}
                                        </p>
                                        <p className="consulta-medico">
                                            Médico: {usersMap[c.id_medico]?.nome || c.id_medico}
                                            {usersMap[c.id_medico]?.cod_doc ? ` (${usersMap[c.id_medico].cod_doc})` : ''}
                                        </p>
                                        <p className="consulta-especialidade">
                                            Cliente: {usersMap[c.id_cliente]?.nome || c.id_cliente}
                                            {usersMap[c.id_cliente]?.cod_doc ? ` (${usersMap[c.id_cliente].cod_doc})` : ''}
                                        </p>
                                    </div>
                                    <span className="consulta-status status-pendente">
                                        {getStatusLabel(c.status_consulta)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Accept modal */}
                {showAcceptModal && currentSolicitacao && (
                    <div className="dialog-backdrop">
                        <div className="dialog-card">
                            <h3>Aceitar solicitação</h3>
                            <p>
                              Solicitado por: {usersMap[currentSolicitacao.id_cliente]?.nome || currentSolicitacao.id_cliente}
                              {' '}em {new Date(currentSolicitacao.data_dia).toLocaleString()}
                            </p>

                            <form onSubmit={handleAccept}>
                                <label className="form-block">
                                    Médico responsável
                                    <select value={selectedMedico} onChange={(e) => setSelectedMedico(e.target.value)} className="full-width">
                                        <option value="">Escolha um médico</option>
                                        {medicos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                                    </select>
                                </label>
                                {actionMsg && <div className="mb-sm">{actionMsg}</div>}
                                <div className="actions-row">
                                    <button type="button" className="Btn" onClick={() => setShowAcceptModal(false)}>Cancelar</button>
                                    <button type="submit" className="Btn">Confirmar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Create modal */}
                {showCreateModal && (
                    <div className="dialog-backdrop">
                        <div className="dialog-card">
                            <h3>Marcar nova consulta</h3>
                            <form onSubmit={handleCreate}>
                                <label className="form-block">
                                    Data e hora
                                    <input type="datetime-local" value={createData} onChange={(e) => setCreateData(e.target.value)} className="full-width" />
                                </label>
                                <label className="form-block">
                                    Médico
                                    <select value={createMedico} onChange={(e) => setCreateMedico(e.target.value)} className="full-width">
                                        <option value="">Escolha um médico</option>
                                        {medicos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                                    </select>
                                </label>
                                <label className="form-block">
                                    Cliente
                                    <select value={createCliente} onChange={(e) => setCreateCliente(e.target.value)} className="full-width">
                                        <option value="">Escolha um cliente</option>
                                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                </label>
                                {actionMsg && <div className="mb-sm">{actionMsg}</div>}
                                <div className="actions-row">
                                    <button type="button" className="Btn" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                                    <button type="submit" className="Btn">Marcar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
        </div>
    );
};

export default PageGerenConsultas;