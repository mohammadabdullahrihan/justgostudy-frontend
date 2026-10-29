import api from './api';

export const getUniversities = async (params) => {
  const response = await api.get('/universities', { params });
  return response.data;
};

export const getAllUniversities = async (params) => {
  const response = await api.get('/universities', { params });
  return response.data;
};

// Distinct country list only, for filter dropdowns — avoids shipping every
// university's full document just to read off `.country`.
export const getUniversityCountries = async () => {
  const response = await api.get('/universities/countries');
  return response.data;
};

export const getUniversityById = async (id) => {
  const response = await api.get(`/universities/${id}`);
  return response.data;
};

export const createUniversity = async (universityPayload) => {
  const response = await api.post('/universities', universityPayload);
  return response.data;
};

export const updateUniversity = async (id, universityPayload) => {
  const response = await api.put(`/universities/${id}`, universityPayload);
  return response.data;
};

export const deleteUniversity = async (id) => {
  const response = await api.delete(`/universities/${id}`);
  return response.data;
};

export const getMyUniversity = async () => {
  const response = await api.get('/universities/my-university');
  return response.data;
};

export const updateMyUniversity = async (universityPayload) => {
  const response = await api.put('/universities/my-university', universityPayload);
  return response.data;
};

const universityService = {
  getUniversities,
  getAllUniversities,
  getUniversityCountries,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  getMyUniversity,
  updateMyUniversity,
};

export default universityService;
