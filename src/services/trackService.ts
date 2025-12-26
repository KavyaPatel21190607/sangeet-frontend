import api from './api';

export interface TrackFilters {
  page?: number;
  limit?: number;
  category?: 'song' | 'podcast';
  genre?: string;
  search?: string;
  sort?: string;
}

export const trackService = {
  // Get all tracks with filters
  getTracks: async (filters: TrackFilters = {}) => {
    const response = await api.get('/tracks', { params: filters });
    return response.data;
  },

  // Get single track
  getTrack: async (id: string) => {
    const response = await api.get(`/tracks/${id}`);
    return response.data;
  },

  // Create track (admin only)
  createTrack: async (data: any) => {
    const response = await api.post('/tracks', data);
    return response.data;
  },

  // Update track (admin only)
  updateTrack: async (id: string, data: any) => {
    const response = await api.put(`/tracks/${id}`, data);
    return response.data;
  },

  // Delete track (admin only)
  deleteTrack: async (id: string) => {
    const response = await api.delete(`/tracks/${id}`);
    return response.data;
  },

  // Get trending tracks
  getTrending: async (limit = 10, category?: string) => {
    const response = await api.get('/tracks/trending/top', {
      params: { limit, category },
    });
    return response.data;
  },

  // Get recent tracks
  getRecent: async (limit = 10, category?: string) => {
    const response = await api.get('/tracks/recent/added', {
      params: { limit, category },
    });
    return response.data;
  },

  // Alias for getRecent (for backward compatibility)
  getRecentTracks: async (limit = 10, category?: string) => {
    return trackService.getRecent(limit, category);
  },

  // Alias for getTrending (for backward compatibility)
  getTrendingTracks: async (limit = 10, category?: string) => {
    return trackService.getTrending(limit, category);
  },
};
