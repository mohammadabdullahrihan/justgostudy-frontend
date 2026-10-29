import api from './api';

export const getLeaderboard = async () => {
  const response = await api.get('/leaderboard');
  return response.data;
};
