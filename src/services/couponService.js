import api from './api';

export const getCoupons = async (params) => {
  const response = await api.get('/coupons', { params });
  return response.data;
};
export const validateCoupon = async (code) => {
  const response = await api.get(`/coupons/validate/${code}`);
  return response.data;
};
export const createCoupon = async (payload) => {
  const response = await api.post('/coupons', payload);
  return response.data;
};
export const updateCoupon = async (id, payload) => {
  const response = await api.put(`/coupons/${id}`, payload);
  return response.data;
};
export const deleteCoupon = async (id) => {
  const response = await api.delete(`/coupons/${id}`);
  return response.data;
};
