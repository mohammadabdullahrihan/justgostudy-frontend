import api from './api';

// Testimonials
export const getTestimonials = async (params) => {
  const response = await api.get('/testimonials', { params });
  return response.data;
};
export const createTestimonial = async (testimonialPayload) => {
  const response = await api.post('/testimonials', testimonialPayload);
  return response.data;
};
export const updateTestimonial = async (id, testimonialPayload) => {
  const response = await api.put(`/testimonials/${id}`, testimonialPayload);
  return response.data;
};
export const deleteTestimonial = async (id) => {
  const response = await api.delete(`/testimonials/${id}`);
  return response.data;
};

// Calculator Defaults
export const getCalculatorDefaults = async () => {
  const response = await api.get('/calculator-defaults');
  return response.data;
};
export const getCalculatorDefaultByCountry = async (country) => {
  const response = await api.get(`/calculator-defaults/country/${country}`);
  return response.data;
};
export const createCalculatorDefault = async (calculatorDefaultPayload) => {
  const response = await api.post('/calculator-defaults', calculatorDefaultPayload);
  return response.data;
};
export const updateCalculatorDefault = async (id, calculatorDefaultPayload) => {
  const response = await api.put(`/calculator-defaults/${id}`, calculatorDefaultPayload);
  return response.data;
};
export const deleteCalculatorDefault = async (id) => {
  const response = await api.delete(`/calculator-defaults/${id}`);
  return response.data;
};

// Destinations
export const getDestinations = async (params) => {
  const response = await api.get('/destinations', { params });
  return response.data;
};
export const getScholarships = async () => {
  const response = await api.get('/destinations/scholarships');
  return response.data;
};
export const getScholarshipsByCountry = async (country) => {
  const response = await api.get(`/destinations/scholarships/by-country/${encodeURIComponent(country)}`);
  return response.data;
};
export const getDestinationByCountry = async (country) => {
  const response = await api.get(`/destinations/by-country/${encodeURIComponent(country)}`);
  return response.data;
};
export const createDestination = async (destinationPayload) => {
  const response = await api.post('/destinations', destinationPayload);
  return response.data;
};
export const updateDestination = async (id, destinationPayload) => {
  const response = await api.put(`/destinations/${id}`, destinationPayload);
  return response.data;
};
export const deleteDestination = async (id) => {
  const response = await api.delete(`/destinations/${id}`);
  return response.data;
};

// Study Search
export const searchStudy = async (params) => {
  const response = await api.get('/study/search', { params });
  return response.data;
};

// Study Programs
export const getStudyPrograms = async (params) => {
  const response = await api.get('/study-programs', { params });
  return response.data;
};
export const getFeaturedPrograms = async () => {
  const response = await api.get('/study-programs/featured');
  return response.data;
};
export const getStudyProgram = async (id) => {
  const response = await api.get(`/study-programs/${id}`);
  return response.data;
};
export const createStudyProgram = async (studyProgramPayload) => {
  const response = await api.post('/study-programs', studyProgramPayload);
  return response.data;
};
export const updateStudyProgram = async (id, studyProgramPayload) => {
  const response = await api.put(`/study-programs/${id}`, studyProgramPayload);
  return response.data;
};
export const deleteStudyProgram = async (id) => {
  const response = await api.delete(`/study-programs/${id}`);
  return response.data;
};

// Consultations
export const createConsultation = async (consultationPayload) => {
  const response = await api.post('/consultations', consultationPayload);
  return response.data;
};
export const getConsultations = async () => {
  const response = await api.get('/consultations');
  return response.data;
};
export const getConsultationById = async (id) => {
  const response = await api.get(`/consultations/${id}`);
  return response.data;
};
export const updateConsultation = async (id, consultationPayload) => {
  const response = await api.put(`/consultations/${id}`, consultationPayload);
  return response.data;
};
export const deleteConsultation = async (id) => {
  const response = await api.delete(`/consultations/${id}`);
  return response.data;
};
export const updateConsultationStatus = async (id, status, adminNotes) => {
  const response = await api.put(`/consultations/${id}/status`, { status, adminNotes });
  return response.data;
};
export const assignConsultation = async (id, assignedTo) => {
  const response = await api.put(`/consultations/${id}/assign`, { assignedTo });
  return response.data;
};

// Newsletters
export const subscribeNewsletter = async (email) => {
  const response = await api.post('/newsletters', { email });
  return response.data;
};
export const getSubscribers = async () => {
  const response = await api.get('/newsletters');
  return response.data;
};
export const sendBulkEmail = async (emailPayload) => {
  const response = await api.post('/newsletters/bulk', emailPayload);
  return response.data;
};
export const updateSubscriber = async (id, subscriberPayload) => {
  const response = await api.put(`/newsletters/${id}`, subscriberPayload);
  return response.data;
};
export const deleteSubscriber = async (id) => {
  const response = await api.delete(`/newsletters/${id}`);
  return response.data;
};
