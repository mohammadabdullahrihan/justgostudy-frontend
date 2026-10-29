import API from './api';

const appointmentService = {
  bookAppointment: async (appointmentData) => {
    const response = await API.post('/appointments', appointmentData);
    return response.data;
  },

  getAllAppointments: async () => {
    const response = await API.get('/appointments');
    return response.data;
  },

  getAppointmentById: async (id) => {
    const response = await API.get(`/appointments/${id}`);
    return response.data;
  },

  updateAppointment: async (id, updateData) => {
    const response = await API.patch(`/appointments/${id}`, updateData);
    return response.data;
  },

  deleteAppointment: async (id) => {
    const response = await API.delete(`/appointments/${id}`);
    return response.data;
  },

  getMyAppointments: async () => {
    const response = await API.get('/appointments/my');
    return response.data;
  }
};

export default appointmentService;
