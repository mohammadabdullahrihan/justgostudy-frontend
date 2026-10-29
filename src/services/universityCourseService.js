import API from './api';

export const getMyCourses = async () => {
  const response = await API.get('/university/courses');
  return response.data;
};

export const createCourse = async (courseData) => {
  const response = await API.post('/university/courses', courseData);
  return response.data;
};

export const updateCourse = async (courseId, courseData) => {
  const response = await API.put(`/university/courses/${courseId}`, courseData);
  return response.data;
};

export const deleteCourse = async (courseId) => {
  const response = await API.delete(`/university/courses/${courseId}`);
  return response.data;
};

export default {
  getMyCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};
