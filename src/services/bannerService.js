import api from './api';

export const getBanners = async (params) => {
  const response = await api.get('/banners', { params });
  return response.data;
};
export const createBanner = async (payload) => {
  const response = await api.post('/banners', payload);
  return response.data;
};
export const updateBanner = async (id, payload) => {
  const response = await api.put(`/banners/${id}`, payload);
  return response.data;
};
export const deleteBanner = async (id) => {
  const response = await api.delete(`/banners/${id}`);
  return response.data;
};
export const trackBannerView = async (id) => {
  await api.post(`/banners/${id}/view`);
};
export const trackBannerClick = async (id) => {
  await api.post(`/banners/${id}/click`);
};
