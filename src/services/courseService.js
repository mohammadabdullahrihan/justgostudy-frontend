import API from './api';

const courseService = {
  getCourses: async (params = {}) => {
    const response = await API.get('/courses', { params });
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await API.get(`/courses/${id}`);
    return response.data;
  },

  // Lightweight { universityId, level } pairs for every course, used to
  // power the Universities page's "course level" filter without paying for
  // the full course+university aggregation.
  getCourseLevelsByUniversity: async () => {
    const response = await API.get('/courses/levels-by-university');
    return response.data;
  },

  createCourse: async (courseData) => {
    const response = await API.post('/courses', courseData);
    return response.data;
  },

  updateCourse: async (id, courseData) => {
    const response = await API.put(`/courses/${id}`, courseData);
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await API.delete(`/courses/${id}`);
    return response.data;
  },
};

export default courseService;
