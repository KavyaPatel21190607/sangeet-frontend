import api from './api';

export const spotifyService = {
  // Search Spotify tracks
  search: async (query: string, limit = 20) => {
    const response = await api.get('/spotify/search', {
      params: { query, limit },
    });
    return response.data;
  },

  // Get track by Spotify ID
  getTrack: async (id: string) => {
    const response = await api.get(`/spotify/track/${id}`);
    return response.data;
  },

  // Get multiple tracks
  getTracks: async (trackIds: string[]) => {
    const response = await api.post('/spotify/tracks', { trackIds });
    return response.data;
  },

  // Get new releases
  getNewReleases: async (limit = 20) => {
    const response = await api.get('/spotify/new-releases', {
      params: { limit },
    });
    return response.data;
  },

  // Get featured playlists
  getFeaturedPlaylists: async (limit = 20) => {
    const response = await api.get('/spotify/featured-playlists', {
      params: { limit },
    });
    return response.data;
  },

  // Get recommendations
  getRecommendations: async (seedTracks: string[], limit = 20) => {
    const response = await api.post('/spotify/recommendations', {
      seedTracks,
      limit,
    });
    return response.data;
  },
};
