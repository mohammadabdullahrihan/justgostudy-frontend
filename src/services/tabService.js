import api from './api';

export const getTabs = async () => {
  const response = await api.get('/tabs');
  return response.data;
};

export const getTabsAdmin = async () => {
  const response = await api.get('/tabs/admin');
  return response.data;
};

export const createTab = async (tabPayload) => {
  const response = await api.post('/tabs', tabPayload);
  return response.data;
};

export const updateTab = async (id, tabPayload) => {
  const response = await api.put(`/tabs/${id}`, tabPayload);
  return response.data;
};

export const deleteTab = async (id) => {
  const response = await api.delete(`/tabs/${id}`);
  return response.data;
};

export const reorderTabs = async (tabOrders) => {
  const response = await api.put('/tabs/reorder', { tabOrders });
  return response.data;
};
