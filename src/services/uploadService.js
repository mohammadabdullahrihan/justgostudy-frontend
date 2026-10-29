import API from './api';

const uploadService = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await API.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadImage: async (file) => uploadService.uploadFile(file),
};

export default uploadService;
