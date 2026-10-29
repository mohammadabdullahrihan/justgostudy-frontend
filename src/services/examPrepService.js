import API from './api';

const examPrepService = {
  getExamPrepData: async () => {
    const response = await API.get('/exam-prep');
    return response.data;
  },

  createExamCard: async (data) => {
    const response = await API.post('/exam-prep/cards', data);
    return response.data;
  },
  updateExamCard: async (id, data) => {
    const response = await API.put(`/exam-prep/cards/${id}`, data);
    return response.data;
  },
  deleteExamCard: async (id) => {
    const response = await API.delete(`/exam-prep/cards/${id}`);
    return response.data;
  },

  createCompareRow: async (data) => {
    const response = await API.post('/exam-prep/compare-rows', data);
    return response.data;
  },
  updateCompareRow: async (id, data) => {
    const response = await API.put(`/exam-prep/compare-rows/${id}`, data);
    return response.data;
  },
  deleteCompareRow: async (id) => {
    const response = await API.delete(`/exam-prep/compare-rows/${id}`);
    return response.data;
  },

  createFaq: async (data) => {
    const response = await API.post('/exam-prep/faqs', data);
    return response.data;
  },
  updateFaq: async (id, data) => {
    const response = await API.put(`/exam-prep/faqs/${id}`, data);
    return response.data;
  },
  deleteFaq: async (id) => {
    const response = await API.delete(`/exam-prep/faqs/${id}`);
    return response.data;
  },
};

export default examPrepService;
