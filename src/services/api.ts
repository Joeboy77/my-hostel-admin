import { API_CONFIG } from '../config/env';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Create a custom error with validation details
        const error = new Error(data.message || `HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        (error as any).validationErrors = data.error?.details || [];
        (error as any).responseData = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Admin Authentication
  async adminLogin(email: string, password: string) {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async healthCheck() {
    return this.request('/health', {
      method: 'GET',
    });
  }

  async getDashboardStats() {
    return this.request('/admin/dashboard', { method: 'GET' });
  }

  async getAllRoomTypes() {
    return this.request('/admin/room-types', { method: 'GET' });
  }

  async getAllProperties() {
    return this.request('/admin/properties', { method: 'GET' });
  }

  async getAllCategories() {
    return this.request('/admin/categories', { method: 'GET' });
  }

  async createProperty(data: any) {
    return this.request('/admin/properties', { 
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateProperty(id: string, data: any) {
    return this.request(`/admin/properties/${id}`, { 
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteProperty(id: string) {
    return this.request(`/admin/properties/${id}`, { method: 'DELETE' });
  }

  async createCategory(data: any) {
    return this.request('/admin/categories', { 
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCategory(id: string, data: any) {
    return this.request(`/admin/categories/${id}`, { 
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/admin/categories/${id}`, { method: 'DELETE' });
  }

  async createRoomType(data: any) {
    return this.request('/admin/room-types', { 
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateRoomType(id: string, data: any) {
    return this.request(`/admin/room-types/${id}`, { 
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteRoomType(id: string) {
    return this.request(`/admin/room-types/${id}`, { method: 'DELETE' });
  }

  // View methods for detailed information
  async getPropertyDetails(id: string) {
    return this.request(`/admin/properties/${id}`, { method: 'GET' });
  }

  async getCategoryDetails(id: string) {
    return this.request(`/admin/categories/${id}`, { method: 'GET' });
  }

  async getRoomTypeDetails(id: string) {
    return this.request(`/admin/room-types/${id}`, { method: 'GET' });
  }

  // User Management Methods
  async getAllUsers(page: number = 1, limit: number = 20, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (search) {
      params.append('search', search);
    }
    return this.request(`/admin/users?${params.toString()}`, { method: 'GET' });
  }

  async getUserDetails(userId: string) {
    return this.request(`/admin/users/${userId}`, { method: 'GET' });
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    return this.request(`/admin/users/${userId}/status`, { 
      method: 'PATCH',
      body: JSON.stringify({ isActive })
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, { method: 'DELETE' });
  }

  async getUserStats() {
    return this.request('/admin/users/stats', { method: 'GET' });
  }

  // Notification Management Methods
  async getAllNotifications(page: number = 1, limit: number = 20, type?: string, isRead?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (type) {
      params.append('type', type);
    }
    if (isRead !== undefined) {
      params.append('isRead', isRead);
    }
    return this.request(`/admin/notifications?${params.toString()}`, { method: 'GET' });
  }

  async getNotificationStats() {
    return this.request('/admin/notifications-stats', { method: 'GET' });
  }

  async createNotification(data: {
    title: string;
    message: string;
    type?: string;
    targetUsers: 'all' | 'verified';
  }) {
    return this.request('/admin/notifications', { 
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteNotification(id: string) {
    return this.request(`/admin/notifications/${id}`, { method: 'DELETE' });
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/admin/notifications/${id}/read`, { method: 'PATCH' });
  }

  // Settings Management Methods
  async getAdminProfile() {
    return this.request('/admin/profile', { method: 'GET' });
  }

  async updateAdminProfile(data: {
    fullName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) {
    return this.request('/admin/profile', { 
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getAppSettings() {
    return this.request('/admin/settings', { method: 'GET' });
  }

  async updateAppSettings(data: {
    maintenanceMode?: boolean;
    allowRegistrations?: boolean;
    requireEmailVerification?: boolean;
    requirePhoneVerification?: boolean;
  }) {
    return this.request('/admin/settings', { 
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
}

export const apiService = new ApiService();
export default apiService; 