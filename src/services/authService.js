import API from './api';

const authService = {
  getMe: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  // extra ({ name, role }) is only used when creating a brand-new account
  firebaseLogin: async (idToken, extra = {}) => {
    const response = await API.post('/auth/firebase-login', { idToken, ...extra });
    return response.data;
  },

  // These trigger our own branded HTML email (sent via Brevo) instead of
  // Firebase's plain-text default — see authController.js.
  sendVerificationEmail: async (email) => {
    const response = await API.post('/auth/send-verification-email', { email });
    return response.data;
  },

  sendPasswordReset: async (email) => {
    const response = await API.post('/auth/send-password-reset', { email });
    return response.data;
  },
};

export default authService;
