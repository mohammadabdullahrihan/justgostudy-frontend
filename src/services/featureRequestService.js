import api from './api';

export const getFeatureRequests = async (params) => {
  const response = await api.get('/feature-requests', { params });
  return response.data;
};
export const createFeatureRequest = async (payload) => {
  const response = await api.post('/feature-requests', payload);
  return response.data;
};
export const updateFeatureRequest = async (id, payload) => {
  const response = await api.put(`/feature-requests/${id}`, payload);
  return response.data;
};
export const addFeatureRequestReply = async (id, text) => {
  const response = await api.post(`/feature-requests/${id}/replies`, { text });
  return response.data;
};
export const deleteFeatureRequest = async (id) => {
  const response = await api.delete(`/feature-requests/${id}`);
  return response.data;
};
