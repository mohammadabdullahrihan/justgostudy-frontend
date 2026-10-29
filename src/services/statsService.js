import API from './api';

export const getStats = async () => {
  const response = await API.get('/stats');
  return response.data;
};

export const getSystemHealth = async () => {
  const response = await API.get('/stats/system-health');
  return response.data;
};

export const getMarketingStats = async () => {
  const response = await API.get('/stats/marketing');
  return response.data;
};

export const getRecentPlacements = async () => {
  const response = await API.get('/stats/recent-placements');
  return response.data;
};
