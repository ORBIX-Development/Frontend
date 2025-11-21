import React, { useEffect, useState, useMemo } from "react";
import Header from '../../components/Header/header.jsx';
import { getUsuarios, updateUsuario, deleteUsuario, updateUsuarioCargo } from '../../Services/api';
import './GerenUser.css';

const PageGerenUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [actionMsg, setActionMsg] = useState(''); 
    const [filterCargo, setFilterCargo] = useState('');
    const [searchName, setSearchName] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const currentRole = (localStorage.getItem('userRole') || '').toLowerCase();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getUsuarios();
                const list = res && res.data ? res.data : res;
                setUsers(Array.isArray(list) ? list : []);
            } catch {
                setError('Erro ao carregar usuários');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleChangeCargo = async (id, novoCargo) => {
        setActionMsg('');
        try {
            await updateUsuarioCargo(id, { cargo: novoCargo });
            setUsers(u => u.map(x => x.id === id ? { ...x, cargo: novoCargo } : x));
            setActionMsg('Cargo atualizado');
        } catch {
            setActionMsg('Erro ao atualizar cargo');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Confirma exclusão do usuário?')) return;
        setActionMsg('');
        try {
            await deleteUsuario(id);
            setUsers(u => u.filter(x => x.id !== id));
            setActionMsg('Usuário excluído');
        } catch {
            setActionMsg('Erro ao excluir usuário');
        }
    };

    const filteredUsers = useMemo(() => {
        const term = String(searchName || '').trim().toLowerCase();
        return (users || []).filter(u => {
            if (filterCargo && u.cargo !== filterCargo) return false;
            if (term && !String(u.nome || '').toLowerCase().includes(term)) return false;
            return true;
        });
    }, [users, filterCargo, searchName]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

    useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [filteredUsers, pageSize, totalPages, page]);

    const paginatedUsers = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, page, pageSize]);

    return (
        <div>
            <Header />
            <div className="page-container">
                <h2>Gerenciar Usuários</h2>
                {currentRole !== 'admin' && <div className="mb-sm">Atenção: esta tela é exclusiva para administradores.</div>}

                <div className="sticky-filter filter-row">
                    <div>
                        <label className="label-small">Filtrar por cargo:</label>
                        <select value={filterCargo} onChange={(e) => setFilterCargo(e.target.value)}>
                            <option value="">Todos</option>
                            <option value="CLIENTE">Cliente</option>
                            <option value="MEDICO">Médico</option>
                            <option value="SECRETARIA">Secretária</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="label-small">Buscar por nome:</label>
                        <input className="" type="text" placeholder="Nome do usuário" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                    </div>
                    <div>
                        <button className="Btn" onClick={() => { setFilterCargo(''); setSearchName(''); }}>Limpar</button>
                    </div>
                </div>
                {actionMsg && <div className="mb-sm">{actionMsg}</div>}
                {loading && <div>Carregando usuários...</div>}
                {error && <div className="error-text">{error}</div>}

                <table className="table-full">
                    <thead>
                        <tr className="table-header">
                            <th>Id</th>
                            <th>Cod_doc</th>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Cargo</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/** aplicar filtros locais */}
                        {paginatedUsers.map(u => (
                            <tr key={u.id} className="table-row">
                                <td>{u.id}</td>
                                <td>{u.cod_doc || '-'}</td>
                                <td>{u.nome}</td>
                                <td>{u.email}</td>
                                <td>
                                    <select value={u.cargo} onChange={(e) => handleChangeCargo(u.id, e.target.value)} disabled={currentRole !== 'admin'}>
                                        <option value="CLIENTE">cliente</option>
                                        <option value="MEDICO">medico</option>
                                        <option value="SECRETARIA">secretaria</option>
                                        <option value="ADMIN">admin</option>
                                    </select>
                                </td>
                                <td>
                                    <button className="Btn" onClick={() => handleDelete(u.id)} disabled={currentRole !== 'admin'}>Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Paginação simples */}
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
            </div>
        </div>
    );
};

export default PageGerenUser;