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
        // Handle 401 Unauthorized - clear auth and redirect to login
        if (response.status === 401) {
          // Clear authentication data
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_data');
          
          // Redirect to login page
          window.location.href = '/login';
          // Return a rejected promise to maintain type safety
          throw new Error('Unauthorized - redirecting to login');
        }
        
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

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
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

  async getRoomTypesByProperty(propertyId: string) {
    return this.request(`/content/properties/${propertyId}/room-types`, { method: 'GET' });
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

  // Regional Section Management Methods
  async getAllRegionalSections() {
    return this.request('/admin/regional-sections', { method: 'GET' });
  }

  async createRegionalSection(data: { name: string; displayOrder?: number }) {
    return this.request('/admin/regional-sections', { 
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateRegionalSection(id: string, data: { name?: string; displayOrder?: number; isActive?: boolean }) {
    return this.request(`/admin/regional-sections/${id}`, { 
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteRegionalSection(id: string) {
    return this.request(`/admin/regional-sections/${id}`, { method: 'DELETE' });
  }

  async assignPropertyToRegionalSection(propertyId: string, regionalSectionId: string) {
    return this.request('/admin/assign-property-to-regional-section', { 
      method: 'POST',
      body: JSON.stringify({ propertyId, regionalSectionId })
    });
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

  async getRegionalSectionDetails(id: string) {
    return this.request(`/admin/regional-sections/${id}`, { method: 'GET' });
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

  async testPushNotification() {
    return this.request('/admin/test-push-notification', { method: 'POST' });
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