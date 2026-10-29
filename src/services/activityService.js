import api from './api';

export const getActivities = async (params) => {
  const response = await api.get('/admin/activities', { params });
  return response.data;
};
