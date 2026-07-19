import api from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  profile_picture?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total_users: number;
  total_admins: number;
  total_organizers: number;
  total_attendees: number;
  total_vendors: number;
  active_users: number;
  inactive_users: number;
}

export const adminService = {
  // Get all users
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // Get a specific user
  getUser: async (userId: number): Promise<User> => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId: number, role: string): Promise<User> => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data.user;
  },

  // Activate/deactivate user
  toggleUserActive: async (userId: number, isActive: boolean): Promise<User> => {
    const response = await api.put(`/admin/users/${userId}/activate`, { is_active: isActive });
    return response.data.user;
  },

  // Delete user
  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  // Get user statistics
  getStats: async (): Promise<UserStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};
