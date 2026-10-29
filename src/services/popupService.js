import api from './api';

export const getPopups = async (params) => {
  const response = await api.get('/popups', { params });
  return response.data;
};
export const createPopup = async (payload) => {
  const response = await api.post('/popups', payload);
  return response.data;
};
export const updatePopup = async (id, payload) => {
  const response = await api.put(`/popups/${id}`, payload);
  return response.data;
};
export const deletePopup = async (id) => {
  const response = await api.delete(`/popups/${id}`);
  return response.data;
};
export const trackPopupView = async (id) => {
  await api.post(`/popups/${id}/view`);
};
export const trackPopupClick = async (id) => {
  await api.post(`/popups/${id}/click`);
};
