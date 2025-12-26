import api from './api';

export const adminService = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Get all users
  getUsers: async (page = 1, limit = 20, filters: any = {}) => {
    const response = await api.get('/admin/users', {
      params: { page, limit, ...filters },
    });
    return response.data;
  },

  // Get single user
  getUser: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Get all tracks (including unpublished)
  getTracks: async (page = 1, limit = 20, filters: any = {}) => {
    const response = await api.get('/admin/tracks', {
      params: { page, limit, ...filters },
    });
    return response.data;
  },

  // Get recent activity
  getActivity: async () => {
    const response = await api.get('/admin/activity');
    return response.data;
  },

  // Get top content
  getTopContent: async () => {
    const response = await api.get('/admin/top-content');
    return response.data;
  },
};
