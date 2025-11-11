import React, { useEffect, useState, useMemo } from "react";
import Header from '../../components/Header/header.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import { getConsultas, getUsuarioById, getReceitas, getConsultasById } from '../../Services/api';
import "./Consulta.css";

const PageConsulta = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [medicosMap, setMedicosMap] = useState({});
  const [showReceitaModal, setShowReceitaModal] = useState(false);
  const [receitaLoading, setReceitaLoading] = useState(false);
  const [currentReceita, setCurrentReceita] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [filterStatus, setFilterStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  // create agendamento moved to /agendamentos

  useEffect(() => {
    const fetchConsultas = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getConsultas();
        const list = res && res.data ? res.data : res;

        let filtered = list;
        if (userId) {
          if (userRole === 'cliente') {
            // Cliente vê apenas suas consultas como paciente
            filtered = list.filter(c => String(c.id_cliente) === String(userId));
          } else if (userRole === 'medico') {
            // Médico vê apenas suas consultas como profissional
            filtered = list.filter(c => String(c.id_medico) === String(userId));
          }
        }

        setConsultas(filtered || []);

        const medIds = Array.from(new Set((filtered || []).map(c => c.id_medico).filter(Boolean)));
        const map = {};
        await Promise.all(medIds.map(async (cid) => {
            const r = await getUsuarioById(cid);
            const user = Array.isArray(r.data) ? r.data[0] : r.data;
            if (user && user.nome) map[cid] = user.nome;
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

  const openReceitaModal = async (consulta) => {
    setShowReceitaModal(true);
    setReceitaLoading(true);
    setCurrentReceita(null);
    try {
      const r = await getReceitas();
      const list = r && r.data ? r.data : r;
      const found = Array.isArray(list) ? list.find(x => Number(x.id_consulta) === Number(consulta.id)) : null;
      if (found) setCurrentReceita(found);
    } catch {
      // ignore
    } finally {
      setReceitaLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return (consultas || []).filter(c => {
      if (filterStatus && String(c.status_consulta) !== String(filterStatus)) return false;
      if (startDate) {
        const d = new Date(c.data_consulta);
        const s = new Date(startDate);
        if (d < s) return false;
      }
      if (endDate) {
        const d = new Date(c.data_consulta);
        const e = new Date(endDate);
        e.setHours(23,59,59,999);
        if (d > e) return false;
      }
      return true;
    });
  }, [consultas, filterStatus, startDate, endDate]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  // Atenção: mock removido. Se precisar de dados fictícios, reativar localmente.

  return (
    <div>
      <Header />
      <div className="med-page">
        <div className="page-card page-container">
          <div className="consultas-header">
            <h2>Consultas Recentes</h2>
          </div>

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
                <option value="CANCELADA">Cancelada</option>
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

          {/* create agendamento is handled on the /agendamentos page */}

          <div className="consultas-grid">
          {paginated.map((c) => (
            <div key={c.id} className="consulta-card" style={{ cursor: 'pointer' }} onClick={() => openReceitaModal(c)}>
              <div className="consulta-info">
                <p className="consulta-medico">{`Dr. ${medicosMap[c.id_medico] || "não encontrado"}`}</p>
                <p className="consulta-especialidade">{c.especialidade || "Clínico Geral"}</p>
                <p className="consulta-data">
                  {new Date(c.data_consulta).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",  
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <p
                className={`consulta-status ${
                  c.status_consulta === "REALIZADA"
                    ? "status-concluida"
                    : c.status_consulta === "NAO-REALIZADA"
                    ? "status-pendente"
                    : "status-cancelada"
                }`}
              >
                {c.status_consulta === "REALIZADA"
                  ? "Concluída"
                  : c.status_consulta === "NAO-REALIZADA"
                  ? "Confirmada"
                  : "Cancelada"}
              </p>
            </div>
          ))}
        </div>

          {/* Receita modal (clicar no card) */}
        {showReceitaModal && (
          <Modal onClose={() => { setShowReceitaModal(false); setCurrentReceita(null); }}>
            <h3 className="modal-title">Receita</h3>
            {receitaLoading && <div>Carregando...</div>}
            {!receitaLoading && !currentReceita && <div>Não há receita para esta consulta.</div>}
            {!receitaLoading && currentReceita && (
              <div>
                <div><strong>Fármaco:</strong> {currentReceita.farmaco || '-'}</div>
                <div><strong>Dose:</strong> {currentReceita.dosagem || '-'}</div>
                <div><strong>Duração:</strong> {currentReceita.duracao || '-'}</div>
                <div><strong>Instrução:</strong> {currentReceita.instrucao || '-'}</div>
              </div>
            )}
            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={() => { setShowReceitaModal(false); setCurrentReceita(null); }}>Fechar</button>
            </div>
          </Modal>
        )}

        {/* create agendamento removed from this page; use /agendamentos instead */}

          <div className="pagination-row">
          <button
            className="Btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ◀
          </button>
          <span>Página {page} de {totalPages}</span>
          <button
            className="Btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            ▶
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default PageConsulta;