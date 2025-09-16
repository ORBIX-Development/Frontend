import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
});

//Usuario
export const getUsuario = () => api.get(`/usuario`);
export const getUsuarioById = (id) => api.get(`/usuario/${id}`);
export const createUsuario = (data) => api.post(`/usuario/insert`,data);
export const updateUsuario = (id,data) => api.put(`/usuario/insert/${id}`,data);
export const deleteUsuario = (id,data) => api.delete(`/usuario/insert/${id}`,data);

//Agendamento
export const getAgendamento = () => api.get(`/agendamento`);
export const getAgendamentoById = (id) => api.get(`/agendamento/${id}`);
export const createAgendamento = (data) => api.post(`/agendamento/insert`,data);
export const updateAgendamento = (id,data) => api.put(`/agendamento/insert/${id}`,data);
export const deleteAgendamento = (id,data) => api.delete(`/agendamento/insert/${id}`,data);

//Atendimento
export const getAtendimento = () => api.get(`/atendimento`);
export const getAtendimentoById = (id) => api.get(`/atendimento/${id}`);
export const createAtendimento = (data) => api.post(`/atendimento/insert`,data);
export const updateAtendimento = (id,data) => api.put(`/atendimento/insert/${id}`,data);
export const deleteAtendimento = (id,data) => api.delete(`/atendimento/insert/${id}`,data);

//Consulta
export const getConsulta = () => api.get(`/consulta`);
export const getConsultaById = (id) => api.get(`/consulta/${id}`);
export const createConsulta = (data) => api.post(`/consulta/insert`,data);
export const updateConsulta = (id,data) => api.put(`/consulta/insert/${id}`,data);
export const deleteConsulta = (id,data) => api.delete(`/consulta/insert/${id}`,data);

export const getConsultaByStatus = (status) => api.get(`/status/${status}`)