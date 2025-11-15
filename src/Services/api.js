import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
});

//Usuario
export const getUsuarios = () => api.get(`/usuarios`);
export const getUsuarioById = (id) => api.get(`/usuarios/${id}`);
export const registerUsuario = (data) => api.post(`/usuarios/register`,data);
export const loginUsuario = (data) => api.post(`/usuarios/login`,data);
export const updateUsuario = (id,data) => api.put(`/usuarios/insert/${id}`,data);
export const searchNomeUsuario = (nome) => api.get(`/usuarios/search/${nome}`);
export const getMedicos = () => api.get(`/usuarios/med`);

export const deleteUsuario = (id) => api.delete(`/usuarios/del/${id}`);

//Agendamento
export const getAgendamentos = () => api.get(`/agendamentos`);
export const getAgendamentoByIdCliente = (id) => api.get(`/agendamentos/${id}`);
export const createAgendamento = (data) => api.post(`/agendamentos/insert`,data);
export const updateAgendamento = (id,data) => api.put(`/agendamentos/insert/${id}`,data);
export const deleteAgendamento = (id) => api.delete(`/agendamentos/del/${id}`);

//Atendimento
export const getAtendimentos = () => api.get(`/atendimentos`);
export const getAtendimentoById = (id) => api.get(`/atendimentos/${id}`);
export const createAtendimento = (data) => api.post(`/atendimentos/insert`,data);
export const updateAtendimento = (id,data) => api.put(`/atendimentos/insert/${id}`,data);
export const deleteAtendimento = (id) => api.delete(`/atendimentos/del/${id}`);

//Consulta
export const getConsultas = () => api.get(`/consultas`);
export const getConsultasById = (id) => api.get(`/consultas/${id}`);
export const createConsulta = (data) => api.post(`/consultas/insert`,data);
export const updateConsulta = (id,data) => api.put(`/consultas/status/${id}`,data);
export const deleteConsulta = (id) => api.delete(`/consultas/del/${id}`);
export const getMedConsultasById = (id) => api.get(`/consultas/med/${id}`);



export const getReceitas = () => api.get(`/receitas`);
export const getReceitaById = (id) => api.get(`/receitas/${id}`);
export const createReceita = (data) => api.post(`/receitas/insert`,data);
export const updateReceita = (id,data) => api.put(`/receitas/insert/${id}`,data);
export const deleteReceita = (id) => api.delete(`/receitas/del/${id}`);

//status
export const getConsultaByStatus = (status) => api.get(`/status/${status}`)
export const getConsultaBydate = (data) => api.get(`/status/date/${data}`)