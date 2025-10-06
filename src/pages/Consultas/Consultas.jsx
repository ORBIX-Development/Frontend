import React, { useEffect, useState, useMemo } from "react";
import Header from '../../components/Header/header.jsx';
import { getConsultas, getUsuarioById, createAgendamento } from '../../Services/api';

const PageConsulta = () => {
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [medicosMap, setMedicosMap] = useState({});
    const [filterStatus, setFilterStatus] = useState('');
    const [searchMedico, setSearchMedico] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [showModal, setShowModal] = useState(false);
    const [dataDia, setDataDia] = useState('');
    const [descricao, setDescricao] = useState('');
    const [agendamentoLoading, setAgendamentoLoading] = useState(false);
    const [agendamentoMsg, setAgendamentoMsg] = useState('');

    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        const fetchConsultas = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getConsultas();
                const list = res && res.data ? res.data : res;

                // filter by role: cliente sees suas consultas; medico vê as suas; secretaria/admin vê todas
                let filtered = list;
                if (userId) {
                    if (userRole === 'cliente') {
                        filtered = list.filter(c => String(c.id_cliente) === String(userId));
                    } else if (userRole === 'medico') {
                        filtered = list.filter(c => String(c.id_medico) === String(userId));
                    }
                }

                setConsultas(filtered || []);

                // fetch médicos names for unique ids
                const medIds = Array.from(new Set((filtered || []).map(c => c.id_medico).filter(Boolean)));
                const map = {};
                await Promise.all(medIds.map(async (mid) => {
                    try {
                        const r = await getUsuarioById(mid);
                        const u = r && r.data ? r.data : r;
                        if (u && u.nome) map[mid] = u.nome;
                    } catch {
                        // ignore
                    }
                }));
                setMedicosMap(map);
            } catch {
                setError('Erro ao carregar consultas');
            } finally {
                setLoading(false);
            }
        };

        fetchConsultas();
    }, [userId, userRole]);

    // todas as consultas serão exibidas em um único container

    const openModal = () => {
        setAgendamentoMsg('');
        setDataDia('');
        setDescricao('');
        setShowModal(true);
    };

    const filteredConsultas = useMemo(() => {
        const term = String(searchMedico || '').trim().toLowerCase();
        return (consultas || []).filter(c => {
            if (filterStatus && c.status_consulta !== filterStatus) return false;
            if (term) {
                const name = (medicosMap[c.id_medico] || '').toLowerCase();
                if (!name.includes(term)) return false;
            }
            return true;
        });
    }, [consultas, filterStatus, searchMedico, medicosMap]);

    const totalPages = Math.max(1, Math.ceil(filteredConsultas.length / pageSize));
    useEffect(() => { if (page > totalPages) setPage(1); }, [filteredConsultas, pageSize, totalPages, page]);
    const paginated = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredConsultas.slice(start, start + pageSize);
    }, [filteredConsultas, page, pageSize]);

    const handleCreateAgendamento = async (e) => {
        e.preventDefault();
        setAgendamentoMsg('');
        if (!dataDia) {
            setAgendamentoMsg('Escolha data e hora');
            return;
        }
        if (!descricao.trim()) {
            setAgendamentoMsg('Descreva o motivo do agendamento');
            return;
        }
        setAgendamentoLoading(true);
        try {
            // backend expects data_dia as datetime string
            await createAgendamento({ data_dia: dataDia, id_usuario: userId, descricao });
            setAgendamentoMsg('Solicitação enviada com sucesso');
            setShowModal(false);
        } catch {
            setAgendamentoMsg('Erro ao enviar solicitação');
        } finally {
            setAgendamentoLoading(false);
        }
    };

    return (
        <div>
            <Header />
            <div className="page-container">
                <h2>Minhas Consultas</h2>
                {!userId && (
                    <div>Usuário não identificado. Faça login para ver suas consultas.</div>
                )}

                {userRole === 'cliente' && (
                    <div className="mb-md">
                        <button className="Btn" onClick={openModal}>Solicitar agendamento</button>
                    </div>
                )}

                {agendamentoMsg && <div className="mb-sm">{agendamentoMsg}</div>}

                {loading && <div>Carregando consultas...</div>}
                {error && <div className="error-text">{error}</div>}

                <div className="sticky-filter">
                    <label className="mr-sm">Status:</label>
                    <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="mr-sm">
                        <option value="">Todos</option>
                        <option value="NAO-REALIZADA">Não realizada</option>
                        <option value="REALIZADA">Realizada</option>
                        <option value="CANCELADA">Cancelada</option>
                    </select>
                    <label className="mr-sm">Buscar médico:</label>
                    <input placeholder="Nome do médico" value={searchMedico} onChange={(e) => { setSearchMedico(e.target.value); setPage(1); }} className="mr-sm" />
                    <button className="Btn" onClick={() => { setFilterStatus(''); setSearchMedico(''); setPage(1); }}>Limpar</button>
                </div>
                <table className="table-full">
                    <thead>
                        <tr className="table-header">
                            <th>Data</th>
                            <th>Status</th>
                            <th>Médico</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map(c => (
                            <tr key={c.id} className="table-row">
                                <td>{new Date(c.data_consulta).toLocaleString()}</td>
                                <td>{({ nao_realizada: 'Não realizada', realizada: 'Realizada', cancelada: 'Cancelada' })[c.status_consulta] || c.status_consulta}</td>
                                <td>{medicosMap[c.id_medico] || c.id_medico}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination-row">
                    <div>
                        <button className="Btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
                        <button className="Btn ml-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Próxima</button>
                    </div>
                    <div>Pagina {page} de {totalPages}</div>
                    <div>
                        <label className="mr-sm">Itens por página:</label>
                        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                    </div>
                </div>

                {/* Modal simples para criar agendamento */}
                {showModal && (
                    <div className="dialog-backdrop">
                        <div className="dialog-card">
                            <h3>Solicitar Agendamento</h3>
                            <form onSubmit={handleCreateAgendamento}>
                                <label className="form-block">
                                    Data e hora
                                    <input type="datetime-local" value={dataDia} onChange={(e) => setDataDia(e.target.value)} className="full-width" />
                                </label>
                                <label className="form-block">
                                    Descrição
                                    <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} className="full-width" />
                                </label>
                                {agendamentoMsg && <div className="mb-sm">{agendamentoMsg}</div>}
                                <div className="actions-row">
                                    <button type="button" className="Btn" onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button type="submit" className="Btn">{agendamentoLoading ? 'Enviando...' : 'Enviar'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PageConsulta;