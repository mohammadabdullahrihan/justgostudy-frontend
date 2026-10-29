import api from './api';

export const getReferrals = async (params) => {
  const response = await api.get('/referrals', { params });
  return response.data;
};
export const upsertReferralReward = async (referredUserId, payload) => {
  const response = await api.put(`/referrals/${referredUserId}`, payload);
  return response.data;
};
export const deleteReferralReward = async (referredUserId) => {
  const response = await api.delete(`/referrals/${referredUserId}`);
  return response.data;
};
