import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
});

//Usuario
export const getUsuarios = () => api.get(`/usuarios`);
export const getUsuariosById = (id) => api.get(`/usuarios/${id}`);
export const createUsuarios = (data) => api.post(`/usuarios/insert`,data);
export const updateUsuarios = (id,data) => api.put(`/usuarios/insert/${id}`,data);
export const deleteUsuarios = (id) => api.delete(`/usuarios/del/${id}`);

//Agendamento
export const getAgendamentos = () => api.get(`/agendamentos`);
export const getAgendamentosById = (id) => api.get(`/agendamentos/${id}`);
export const createAgendamentos = (data) => api.post(`/agendamentos/insert`,data);
export const updateAgendamentos = (id,data) => api.put(`/agendamentos/insert/${id}`,data);
export const deleteAgendamentos = (id) => api.delete(`/agendamentos/del/${id}`);

//Atendimento
export const getAtendimentos = () => api.get(`/atendimentos`);
export const getAtendimentosById = (id) => api.get(`/atendimentos/${id}`);
export const createAtendimentos = (data) => api.post(`/atendimentos/insert`,data);
export const updateAtendimentos = (id,data) => api.put(`/atendimentos/insert/${id}`,data);
export const deleteAtendimentos = (id) => api.delete(`/atendimentos/del/${id}`);

//Consulta
export const getConsultas = () => api.get(`/consultas`);
export const getConsultasById = (id) => api.get(`/consultas/${id}`);
export const createConsultas = (data) => api.post(`/consultas/insert`,data);
export const updateConsultas = (id,data) => api.put(`/consultas/insert/${id}`,data);
export const deleteConsultas = (id) => api.delete(`/consultas/del/${id}`);


export const getReceitas = () => api.get(`/receitas`);
export const getReceitasById = (id) => api.get(`/receitas/${id}`);
export const createReceitas = (data) => api.post(`/receitas/insert`,data);
export const updateReceitas = (id,data) => api.put(`/receitas/insert/${id}`,data);
export const deleteReceitas = (id) => api.delete(`/receitas/del/${id}`);

//status
export const getConsultaByStatus = (status) => api.get(`/status/${status}`)
export const getConsultaBydate = (data) => api.get(`/status/date/${data}`)