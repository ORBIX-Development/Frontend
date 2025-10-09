import React, { useEffect, useState, useMemo } from "react";
import Header from '../../components/Header/header.jsx';
import { getConsultas, getUsuarioById } from '../../Services/api';
import "./Consulta.css";

const PageConsulta = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [medicosMap, setMedicosMap] = useState({});
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

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
        await Promise.all(medIds.map(async (mid) => {
          try {
            const r = await getUsuarioById(mid);
            const u = r && r.data ? r.data : r;
            if (u && u.nome) map[mid] = u.nome;
          } catch {}
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

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return consultas.slice(start, start + pageSize);
  }, [consultas, page]);

  const totalPages = Math.max(1, Math.ceil(consultas.length / pageSize));

  // Exemplo de mock para teste (remova isso em produção)
  const mockConsulta = (id, idCliente, idMedico, status) => ({
    id,
    id_cliente: idCliente,
    id_medico: idMedico,
    data_consulta: new Date().toISOString(),
    especialidade: "Clínico Geral",
    status_consulta: status
  });

  // Simulação de consultas para teste (remova ou ajuste conforme API real)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && consultas.length === 0) {
      setConsultas([
        mockConsulta(1, "2", "1", "REALIZADA"), // Consulta 1: Médico (id 1), Cliente (id 2)
        mockConsulta(2, "2", "1", "NAO-REALIZADA"), // Outra consulta para teste
        mockConsulta(3, "3", "1", "CANCELADA"), // Adicionada para teste
      ]);
    }
  }, []);

  return (
    <div>
      <Header />
      <div className="page-container">
        <div className="consultas-header">
          <h2>Consultas Recentes</h2>
        </div>

        {loading && <div>Carregando...</div>}
        {error && <div className="error-text">{error}</div>}

        <div className="consultas-grid">
          {paginated.map((c) => (
            <div key={c.id} className="consulta-card">
              <div className="consulta-info">
                <p className="consulta-medico">{medicosMap[c.id_medico] || "Dr. (não encontrado)"}</p>
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
  );
};

export default PageConsulta;