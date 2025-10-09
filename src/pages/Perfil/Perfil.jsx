import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import Header from '../../components/Header/header.jsx';
import { getUsuarioById, updateUsuario } from '../../Services/api.js';
import './perfil.css';

const Perfil = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ nome: '', email: '', cargo: '' });
    const currentUserRole = (localStorage.getItem('userRole') || '').toLowerCase();

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            setError(null);
            try {
                const userId = id || localStorage.getItem('userId');
                if (!userId) throw new Error('Nenhum id de usuário fornecido');
                let data;
                try {
                    const res = await getUsuarioById(userId);
                    data = res && res.data ? res.data : res;
                } catch (apiErr) {
                    const mockKey = `mock_user_${userId}`;
                    const raw = localStorage.getItem(mockKey);
                    if (raw) {
                        try { data = JSON.parse(raw); } catch { data = null; }
                    }
                    if (!data) throw apiErr;
                }
                if (!data) throw new Error('Usuário não encontrado');
                setUser(data);
                setForm({ nome: data.nome || data.name || '', email: data.email || '', cargo: data.cargo || data.role || '' });
            } catch (err) {
                setError(err.message || 'Erro ao carregar usuário');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        const payload = { nome: form.nome, email: form.email };
        if (currentUserRole === 'admin') payload.cargo = form.cargo;
        try {
            const userId = id || localStorage.getItem('userId');
            await updateUsuario(userId, payload);
            setUser({ ...user, ...payload });
            setEditing(false);
        } catch (err) {
            try {
                const userId = id || localStorage.getItem('userId');
                const mockKey = `mock_user_${userId}`;
                const raw = localStorage.getItem(mockKey);
                if (raw) {
                    const existing = JSON.parse(raw);
                    const updated = { ...existing, ...payload };
                    localStorage.setItem(mockKey, JSON.stringify(updated));
                    setUser(updated);
                    setEditing(false);
                    setError('Atualizado localmente (mock)');
                } else {
                    setError(err.message || 'Erro ao atualizar');
                }
            } catch {
                setError(err.message || 'Erro ao atualizar');
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div>
            <Header />
            <div className="container perfil-wrapper">
                <div className="content">
                    <div className="first-content">
                        <div className="first-column">
                            <div className="page-container centered">
                                <h3 className="title title-primary">Perfil</h3>
                                <p className="description description-primary">Gerencie suas informações</p>
                            </div>
                        </div>
                        <div className="second-column">
                            <div className="w-80">
                                {loading && <p>Carregando...</p>}
                                {error && <p className="error">{error}</p>}

                                {!loading && user && (
                                    <div className="perfil-card">
                                        <h2>Perfil do Usuário</h2>
                                        <div className="form">
                                            <label className="label-input">
                                                {editing ? (
                                                    <>
                                                        <input name="email" value={form.email} onChange={handleChange} placeholder=" " />
                                                        <span>Email</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <input readOnly value={user.email} placeholder=" " />
                                                        <span>Email</span>
                                                    </>
                                                )}
                                            </label>

                                            <label className="label-input">
                                                {editing ? (
                                                    <>
                                                        <input name="nome" value={form.nome} onChange={handleChange} placeholder=" " />
                                                        <span>Nome completo</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <input readOnly value={user.nome || user.name} placeholder=" " />
                                                        <span>Nome completo</span>
                                                    </>
                                                )}
                                            </label>

                                            <label className="label-input">
                                                {editing && currentUserRole === 'admin' ? (
                                                    <>
                                                        <select name="cargo" value={form.cargo} onChange={handleChange} className="" >
                                                            <option value="">-- selecione --</option>
                                                            <option value="cliente">cliente</option>
                                                            <option value="medico">medico</option>
                                                            <option value="secretaria">secretaria</option>
                                                            <option value="admin">admin</option>
                                                        </select>
                                                        <span>Cargo</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <input readOnly value={user.cargo || user.role || '-'} placeholder=" " />
                                                        <span>Cargo</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>

                                        {editing ? (
                                            <div>
                                                <button className="btn btn-primary mr-sm" onClick={handleSave} disabled={loading}>Salvar</button>
                                                <button className="btn btn-secondary" onClick={() => { setEditing(false); setForm({ nome: user.nome || user.name || '', email: user.email || '', cargo: user.cargo || user.role || '' }); }} disabled={loading}>Cancelar</button>
                                            </div>
                                        ): (
                                                <button className="btn btn-primary" onClick={() => setEditing(true)}>Editar Perfil</button>
                                            )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Perfil;