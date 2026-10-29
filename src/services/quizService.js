import api from './api';

export const submitQuiz = async (payload) => {
  const response = await api.post('/quiz/submit', payload);
  return response.data;
};
export const getQuizResults = async (params) => {
  const response = await api.get('/quiz/results', { params });
  return response.data;
};
export const deleteQuizResult = async (id) => {
  const response = await api.delete(`/quiz/results/${id}`);
  return response.data;
};
