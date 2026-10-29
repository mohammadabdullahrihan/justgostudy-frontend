import API from './api';

const agentService = {
  getMyProfile: async () => {
    const response = await API.get('/agents/me');
    return response.data;
  },

  updateMyProfile: async (profileData) => {
    const response = await API.put('/agents/me', profileData);
    return response.data;
  },

  getAssignedStudents: async () => {
    const response = await API.get('/agents/my-students');
    return response.data;
  },

  // Admin/super_admin only. Returns every agent profile (with populated user
  // info) in one call, so callers don't need to fetch each agent's profile
  // individually.
  getAllAgents: async () => {
    const response = await API.get('/agents');
    return response.data;
  },

  getReferralLeaderboard: async () => {
    const response = await API.get('/agents/referral-leaderboard');
    return response.data;
  },
};

export default agentService;
