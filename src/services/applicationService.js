import API from './api';

const applicationService = {
  createApplication: async (applicationData) => {
    const response = await API.post('/applications', applicationData);
    return response.data;
  },

  getMyApplications: async () => {
    const response = await API.get('/applications/my');
    return response.data;
  },

  getAgentApplications: async () => {
    const response = await API.get('/applications/agent');
    return response.data;
  },

  getUniversityApplications: async () => {
    const response = await API.get('/applications/university');
    return response.data;
  },

  getAllApplications: async () => {
    const response = await API.get('/applications/all');
    return response.data;
  },

  // rejectionReason is required when status is 'rejected'
  updateApplicationStatus: async (id, status, rejectionReason) => {
    const response = await API.put(`/applications/${id}/status`, { status, rejectionReason });
    return response.data;
  },

  // Admin/super_admin only — reassign course/university on an application
  updateApplication: async (id, data) => {
    const response = await API.put(`/applications/${id}`, data);
    return response.data;
  },

  // Admin/super_admin only
  deleteApplication: async (id) => {
    const response = await API.delete(`/applications/${id}`);
    return response.data;
  },

  addAgentNote: async (id, note) => {
    const response = await API.post(`/applications/${id}/notes`, { note });
    return response.data;
  },
};

export default applicationService;
