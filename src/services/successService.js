import API from './api';

const successService = {
  getAllSuccess: async () => {
    const response = await API.get('/success');
    return response.data;
  },

  getSuccessById: async (id) => {
    const response = await API.get(`/success/${id}`);
    return response.data;
  },

  createSuccess: async (successData) => {
    const response = await API.post('/success', successData);
    return response.data;
  },

  updateSuccess: async (id, successData) => {
    const response = await API.put(`/success/${id}`, successData);
    return response.data;
  },

  deleteSuccess: async (id) => {
    const response = await API.delete(`/success/${id}`);
    return response.data;
  },
};

export default successService;
