import api from './api';

export const getFaqs = async (params) => {
  const response = await api.get('/faqs', { params });
  return response.data;
};
export const createFaq = async (payload) => {
  const response = await api.post('/faqs', payload);
  return response.data;
};
export const updateFaq = async (id, payload) => {
  const response = await api.put(`/faqs/${id}`, payload);
  return response.data;
};
export const deleteFaq = async (id) => {
  const response = await api.delete(`/faqs/${id}`);
  return response.data;
};
