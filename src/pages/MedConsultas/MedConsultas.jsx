import React, { useEffect, useState, useMemo } from "react";
import Header from '../../components/Header/header.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import useToast from '../../components/Toast/useToast.js';
import usePagination from '../../hooks/usePagination';
import { getConsulta, getUsuarioById, updateConsulta, createAtendimento } from '../../Services/api';

const PageConsultaMedico = () => {
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [clientesMap, setClientesMap] = useState({});
    const [filterStatus, setFilterStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterName, setFilterName] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // modal para observação ao finalizar
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [currentConsulta, setCurrentConsulta] = useState(null);
    const [observation, setObservation] = useState('');
    const [prescription, setPrescription] = useState('');
    const [actionMsg, setActionMsg] = useState('');

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getConsulta();
                const list = res && res.data ? res.data : res;
                const my = (Array.isArray(list) ? list : []).filter(c => String(c.id_medico) === String(userId));
                setConsultas(my);

                const clientIds = Array.from(new Set(my.map(c => c.id_cliente).filter(Boolean)));
                const map = {};
                await Promise.all(clientIds.map(async (cid) => {
                    try {
                        const r = await getUsuarioById(cid);
                        const u = r && r.data ? r.data : r;
                        if (u && u.nome) map[cid] = u.nome;
                    } catch {
                        // ignore
                    }
                }));
                setClientesMap(map);
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
            if (filterName) {
                const name = (clientesMap[c.id_cliente] || '').toLowerCase();
                if (!name.includes(filterName.toLowerCase())) return false;
            }
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
    }, [consultas, filterStatus, filterName, startDate, endDate, clientesMap]);

    const { paginated, totalPages } = usePagination(filtered, page, pageSize);
    useEffect(() => { if (page > totalPages) setPage(1); }, [filtered, pageSize, totalPages, page]);

    const toast = useToast();

    const openCompleteModal = (consulta) => {
        setCurrentConsulta(consulta);
        setObservation('');
        setPrescription('');
        setActionMsg('');
        setShowCompleteModal(true);
    };

    const handleConfirmRealizada = async () => {
        if (!currentConsulta) return;
        setActionMsg('');
        try {
            await updateConsulta(currentConsulta.id, { status_consulta: 'realizada' });
            // criar atendimento com observação e prescrição
            await createAtendimento({ data_atendimento: new Date().toISOString(), id_usuario: currentConsulta.id_cliente, descricao: observation || 'Consulta realizada', prescricao: prescription || '' });
            setConsultas(prev => prev.map(c => c.id === currentConsulta.id ? { ...c, status_consulta: 'realizada' } : c));
            setShowCompleteModal(false);
            toast.push({ type: 'success', title: 'Concluído', message: 'Consulta marcada como realizada e atendimento criado.' });
        } catch {
            setActionMsg('Erro ao marcar como realizada');
            toast.push({ type: 'error', title: 'Erro', message: 'Não foi possível concluir. Tente novamente.' });
        }
    };

    const statusLabel = (s) => ({ nao_realizada: 'Não realizada', realizada: 'Realizada', cancelada: 'Cancelada' }[s] || s);

    return (
        <div>
            <Header />
            <div className="page-container">
                <h2>Minhas consultas</h2>
                {loading && <div>Carregando...</div>}
                {error && <div className="error-text">{error}</div>}

                {/* filtros */}
                <div className="sticky-filter filter-row">
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
                        Paciente:
                        <input placeholder="Digite parte do nome para buscar" value={filterName} onChange={e => { setFilterName(e.target.value); setPage(1); }} className="ml-xs" />
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
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                    </label>
                </div>

                <table className="table-full">
                    <thead>
                        <tr className="table-header">
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(paginated.length === 0) && (
                            <tr><td colSpan={4} className="mb-sm">Nenhuma consulta encontrada.</td></tr>
                        )}
                        {paginated.map(c => (
                            <tr key={c.id} className="table-row">
                                <td>{new Date(c.data_consulta).toLocaleString()}</td>
                                <td>{clientesMap[c.id_cliente] || c.id_cliente}</td>
                                <td>{statusLabel(c.status_consulta)}</td>
                                <td>
                                    {c.status_consulta !== 'realizada' && (
                                        <button className="Btn" onClick={() => openCompleteModal(c)}>Marcar como realizada</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* paginação */}
                <div className="pagination-row">
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
                        <div className="mb-sm">
                            <label>Observação (o que aconteceu)</label>
                            <textarea value={observation} onChange={e => setObservation(e.target.value)} rows={4} className="full-width" placeholder="Descreva o que foi feito ou observado durante a consulta" />
                        </div>
                        <div className="mb-sm">
                            <label>Prescrição (opcional)</label>
                            <textarea value={prescription} onChange={e => setPrescription(e.target.value)} rows={3} className="full-width" placeholder="Medicamentos, doses ou instruções para o paciente" />
                        </div>
                        {actionMsg && <div className="error-text mb-sm">{actionMsg}</div>}
                        <div className="actions-row">
                            <button className="Btn" onClick={() => { setShowCompleteModal(false); setCurrentConsulta(null); }}>Fechar</button>
                            <button className="Btn" onClick={handleConfirmRealizada}>Salvar e encerrar</button>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default PageConsultaMedico;