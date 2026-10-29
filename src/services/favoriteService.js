import api from './api';

export const addFavorite = (courseId) => api.post('/favorites', { courseId });
export const removeFavorite = (courseId) => api.delete(`/favorites/${courseId}`);
export const getFavorites = () => api.get('/favorites');
