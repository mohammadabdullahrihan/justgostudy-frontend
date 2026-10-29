import API from './api';

export const getLanguages = async () => {
  const response = await API.get('/languages');
  return response.data;
};

export const getLanguageById = async (languageId) => {
  const response = await API.get(`/languages/${languageId}`);
  return response.data;
};

export const completeLesson = async (languageId, lessonId) => {
  const response = await API.post(`/languages/${languageId}/lessons/${lessonId}/complete`);
  return response.data;
};

export const getMyLanguageProgress = async (languageId) => {
  const response = await API.get(`/languages/${languageId}/progress`);
  return response.data;
};

export const syncLanguageProgress = async (languageId, completedLessonIds) => {
  const response = await API.post(`/languages/${languageId}/lessons/sync`, { completedLessonIds });
  return response.data;
};
