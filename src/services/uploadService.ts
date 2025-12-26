import api from './api';

export const uploadService = {
  // Upload audio file
  uploadAudio: async (file: File) => {
    const formData = new FormData();
    formData.append('audio', file);

    const response = await api.post('/upload/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload image file
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload complete track (audio + cover image) - for file uploads
  uploadTrackFiles: async (audioFile: File, coverImageFile?: File) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    if (coverImageFile) {
      formData.append('coverImage', coverImageFile);
    }

    const response = await api.post('/upload/track', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Create track in database with uploaded file URLs
  uploadTrack: async (trackData: {
    title: string;
    artist: string;
    album?: string;
    category: string;
    audioUrl: string;
    coverImage: string;
    genre?: string;
  }) => {
    const response = await api.post('/tracks', trackData);
    return response.data;
  },

  // Delete file
  deleteFile: async (filePath: string) => {
    const response = await api.delete('/upload/file', {
      data: { filePath },
    });
    return response.data;
  },
};
