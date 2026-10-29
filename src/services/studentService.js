import API from './api';

const studentService = {
  getMyStudentProfile: async () => {
    const response = await API.get('/students/me');
    return response.data;
  },

  updateMyStudentProfile: async (profileData) => {
    const response = await API.put('/students/me', profileData);
    return response.data;
  },

  // Admin/super_admin only
  assignAgent: async (studentId, agentId) => {
    const response = await API.put(`/students/${studentId}/assign-agent`, { agentId });
    return response.data;
  },

  // Admin/super_admin only — full student profile list, used to power the
  // "View Profile" detail panel in User Management.
  getAllStudents: async () => {
    const response = await API.get('/students');
    return response.data;
  },
};

export default studentService;
