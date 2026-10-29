import API from './api';

const userService = {
  // Server-side paginated + searchable. Returns { users, total, page, pages }.
  getUsers: async ({ page, limit, search, role } = {}) => {
    const params = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (search) params.search = search;
    if (role) params.role = role;
    const response = await API.get('/users', { params });
    return response.data;
  },

  updateUser: async (userId, data) => {
    const response = await API.put(`/users/${userId}`, data);
    return response.data;
  },

  // super admin only
  deleteUser: async (userId) => {
    const response = await API.delete(`/users/${userId}`);
    return response.data;
  },

  getMyReferrals: async () => {
    const response = await API.get('/users/referrals/me');
    return response.data;
  },
};

export default userService;
