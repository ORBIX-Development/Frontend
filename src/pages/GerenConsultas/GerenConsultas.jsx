import React, { useEffect, useState } from "react";
import Header from '../../components/Header/header.jsx';
import { getAgendamentos, deleteAgendamento, getUsuarios, createConsulta, getConsultas } from '../../Services/api';
import '../Consultas/Consulta.css';

const PageGerenConsultas = () => {
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [users, setUsers] = useState([]); // for medicos/clientes

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
                const [agRes, uRes, cRes] = await Promise.all([getAgendamentos(), getUsuarios(), getConsultas()]);
                const ag = agRes && agRes.data ? agRes.data : agRes;
                const us = uRes && uRes.data ? uRes.data : uRes;
                const cs = cRes && cRes.data ? cRes.data : cRes;

                setSolicitacoes(Array.isArray(ag) ? ag : []);
                setUsers(Array.isArray(us) ? us : []);

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

    const medicos = users.filter(u => u.cargo === 'medico');
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
        if (!selectedMedico) {
            setActionMsg('Escolha um médico');
            return;
        }
        try {
            // criar consulta com dados da solicitação
            await createConsulta({ status_consulta: 'nao_realizada', data_consulta: currentSolicitacao.data_dia, id_medico: selectedMedico, id_cliente: currentSolicitacao.id_usuario });
            // remover a solicitação
            await deleteAgendamento(currentSolicitacao.id);
            setActionMsg('Solicitação aceita e consulta marcada');
            // atualizar listas localmente
            setSolicitacoes(solicitacoes.filter(s => s.id !== currentSolicitacao.id));
            // atualizar consultas: adicionar criada (simplificação: refetch seria ideal)
            setConsultas(prev => [...prev, { data_consulta: currentSolicitacao.data_dia, status_consulta: 'nao_realizada', id_medico: selectedMedico, id_cliente: currentSolicitacao.id_usuario }]);
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
            await createConsulta({ status_consulta: 'nao_realizada', data_consulta: createData, id_medico: createMedico, id_cliente: createCliente });
            setActionMsg('Consulta marcada com sucesso');
            setConsultas(prev => [...prev, { data_consulta: createData, status_consulta: 'nao_realizada', id_medico: createMedico, id_cliente: createCliente }]);
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

    // UI: apenas secretária deve usar essa página, mas permissões são simples aqui
    return (
        <div>
            <Header />
            <div className="page-container">
                <h2>Gerenciar Consultas</h2>
                {userRole !== 'secretaria' && <div>Atenção: esta tela é destinada à secretária.</div>}

                <div className="mb-md">
                    <button className="Btn" onClick={openCreate}>Marcar nova consulta</button>
                </div>

                {actionMsg && <div className="mb-sm">{actionMsg}</div>}

                {loading && <div>Carregando...</div>}
                {error && <div className="error-text">{error}</div>}

                <section>
                    <h3>Solicitações</h3>
                    {solicitacoes.length === 0 && <div>Não há solicitações.</div>}
                    <ul>
                        {solicitacoes.map(s => (
                            <li key={s.id} className="list-item">
                                <strong>{new Date(s.data_dia).toLocaleString()}</strong>
                                {' - '}Solicitado por: {usersMap[s.id_usuario]?.nome || s.id_usuario} {usersMap[s.id_usuario]?.cod_doc ? `(${usersMap[s.id_usuario].cod_doc})` : ''}
                                <div className="mt-xs actions-row">
                                    <button className="Btn" onClick={() => openAccept(s)}>Aceitar</button>
                                    <button className="Btn" onClick={() => handleDeny(s)}>Negar</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="mt-md">
                    <h3>Agenda (a partir de hoje)</h3>
                    {consultas.length === 0 && <div>Nenhuma consulta agendada.</div>}
                    <ul>
                        {consultas.map((c, idx) => (
                            <li key={idx} className="list-item">
                                <strong>{new Date(c.data_consulta).toLocaleString()}</strong>
                                {' - '}{statusMap[c.status_consulta] || c.status_consulta}
                                {' - Médico: '}{usersMap[c.id_medico]?.nome || c.id_medico} {usersMap[c.id_medico]?.cod_doc ? `(${usersMap[c.id_medico].cod_doc})` : ''}
                                {' - Cliente: '}{usersMap[c.id_cliente]?.nome || c.id_cliente} {usersMap[c.id_cliente]?.cod_doc ? `(${usersMap[c.id_cliente].cod_doc})` : ''}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Accept modal */}
                {showAcceptModal && currentSolicitacao && (
                    <div className="dialog-backdrop">
                        <div className="dialog-card">
                            <h3>Aceitar solicitação</h3>
                            <p>Solicitado por: {currentSolicitacao.id_usuario} em {new Date(currentSolicitacao.data_dia).toLocaleString()}</p>
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
    );
};

export default PageGerenConsultas;