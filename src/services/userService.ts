import api from './api';

export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: { name?: string; email?: string; profilePicture?: string }) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  // Update settings
  updateSettings: async (settings: any) => {
    const response = await api.put('/users/settings', settings);
    return response.data;
  },

  // Like/unlike track
  likeTrack: async (trackId: string) => {
    const response = await api.post(`/users/like-track/${trackId}`);
    return response.data;
  },

  // Get liked tracks
  getLikedTracks: async () => {
    const response = await api.get('/users/liked-tracks');
    return response.data;
  },

  // Record track play
  playTrack: async (trackId: string, duration?: number) => {
    const response = await api.post(`/users/play-track/${trackId}`, { duration });
    return response.data;
  },

  // Upgrade to premium
  upgradePremium: async () => {
    const response = await api.put('/users/upgrade-premium');
    return response.data;
  },
};
