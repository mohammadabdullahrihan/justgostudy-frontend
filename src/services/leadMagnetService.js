import api from './api';

export const getLeadMagnets = async (params) => {
  const response = await api.get('/lead-magnets', { params });
  return response.data;
};
export const createLeadMagnet = async (payload) => {
  const response = await api.post('/lead-magnets', payload);
  return response.data;
};
export const updateLeadMagnet = async (id, payload) => {
  const response = await api.put(`/lead-magnets/${id}`, payload);
  return response.data;
};
export const deleteLeadMagnet = async (id) => {
  const response = await api.delete(`/lead-magnets/${id}`);
  return response.data;
};
export const downloadLeadMagnet = async (id, payload) => {
  const response = await api.post(`/lead-magnets/${id}/download`, payload);
  return response.data;
};
export const getLeadDownloads = async (params) => {
  const response = await api.get('/lead-magnets/downloads/all', { params });
  return response.data;
};
export const deleteLeadDownload = async (id) => {
  const response = await api.delete(`/lead-magnets/downloads/${id}`);
  return response.data;
};
