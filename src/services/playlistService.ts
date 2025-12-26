import api from './api';

export const playlistService = {
  // Get all playlists
  getPlaylists: async (page = 1, limit = 20) => {
    const response = await api.get('/playlists', { params: { page, limit } });
    return response.data;
  },

  // Get user's own playlists
  getMyPlaylists: async () => {
    const response = await api.get('/playlists/my');
    return response.data;
  },

  // Get single playlist
  getPlaylist: async (id: string) => {
    const response = await api.get(`/playlists/${id}`);
    return response.data;
  },

  // Create playlist
  createPlaylist: async (data: {
    name: string;
    description?: string;
    coverImage?: string;
    isPublic?: boolean;
  }) => {
    const response = await api.post('/playlists', data);
    return response.data;
  },

  // Update playlist
  updatePlaylist: async (id: string, data: any) => {
    const response = await api.put(`/playlists/${id}`, data);
    return response.data;
  },

  // Delete playlist
  deletePlaylist: async (id: string) => {
    const response = await api.delete(`/playlists/${id}`);
    return response.data;
  },

  // Add track to playlist
  addTrack: async (playlistId: string, trackId: string) => {
    const response = await api.post(`/playlists/${playlistId}/tracks/${trackId}`);
    return response.data;
  },

  // Remove track from playlist
  removeTrack: async (playlistId: string, trackId: string) => {
    const response = await api.delete(`/playlists/${playlistId}/tracks/${trackId}`);
    return response.data;
  },
};
