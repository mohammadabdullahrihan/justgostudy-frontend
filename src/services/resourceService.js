import API from './api';

const resourceService = {
  getResources: async (params = {}) => {
    const response = await API.get('/resources', { params });
    return response.data;
  },

  getResourcesAdmin: async (params = {}) => {
    const response = await API.get('/resources/admin/all', { params });
    return response.data;
  },

  getResourceById: async (id) => {
    const response = await API.get(`/resources/${id}`);
    return response.data;
  },

  getResourceBySlug: async (slug) => {
    const response = await API.get(`/resources/slug/${slug}`);
    return response.data;
  },

  createResource: async (resourceData) => {
    const response = await API.post('/resources', resourceData);
    return response.data;
  },

  updateResource: async (id, resourceData) => {
    const response = await API.put(`/resources/${id}`, resourceData);
    return response.data;
  },

  deleteResource: async (id) => {
    const response = await API.delete(`/resources/${id}`);
    return response.data;
  },
};

export default resourceService;
