import API from './api';

const flashcardService = {
  getFlashcards: async (languageId) => {
    const response = await API.get('/flashcards', { params: { languageId } });
    return response.data;
  },

  getFlashcardLanguages: async () => {
    const response = await API.get('/flashcards/languages');
    return response.data;
  },

  getFlashcardsAdmin: async (params = {}) => {
    const response = await API.get('/flashcards/admin/all', { params });
    return response.data;
  },

  createFlashcard: async (data) => {
    const response = await API.post('/flashcards', data);
    return response.data;
  },

  updateFlashcard: async (id, data) => {
    const response = await API.put(`/flashcards/${id}`, data);
    return response.data;
  },

  deleteFlashcard: async (id) => {
    const response = await API.delete(`/flashcards/${id}`);
    return response.data;
  },

  completeDeck: async () => {
    const response = await API.post('/flashcards/streak-checkin');
    return response.data;
  },
};

export default flashcardService;
