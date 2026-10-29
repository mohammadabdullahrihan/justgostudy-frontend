import api from './api';

export const getSeoMetaList = async (params) => {
  const response = await api.get('/seo-meta', { params });
  return response.data;
};
export const getSeoMetaByPage = async (pageKey) => {
  const response = await api.get('/seo-meta', { params: { pageKey } });
  return response.data;
};
export const createSeoMeta = async (payload) => {
  const response = await api.post('/seo-meta', payload);
  return response.data;
};
export const updateSeoMeta = async (id, payload) => {
  const response = await api.put(`/seo-meta/${id}`, payload);
  return response.data;
};
export const deleteSeoMeta = async (id) => {
  const response = await api.delete(`/seo-meta/${id}`);
  return response.data;
};
