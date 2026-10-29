import api from './api';

export const getEvents = async (params) => {
  const response = await api.get('/events', { params });
  return response.data;
};
export const createEvent = async (payload) => {
  const response = await api.post('/events', payload);
  return response.data;
};
export const updateEvent = async (id, payload) => {
  const response = await api.put(`/events/${id}`, payload);
  return response.data;
};
export const deleteEvent = async (id) => {
  const response = await api.delete(`/events/${id}`);
  return response.data;
};
