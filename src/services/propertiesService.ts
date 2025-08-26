import apiService from './api';

export interface Property {
  id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  propertyType: string;
  status: string;
  isActive: boolean;
  isFeatured: boolean;
  category: Category;
  roomTypes: RoomType[];
  amenities: string[];
  images: string[];
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  genderType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyData {
  name: string;
  description: string;
  price: number;
  location: string;
  propertyType: string;
  categoryId: string;
  amenities: string[];
  latitude?: number;
  longitude?: number;
}

export interface CreateCategoryData {
  name: string;
  description: string;
  image?: File;
}

export interface CreateRoomTypeData {
  name: string;
  description: string;
  price: number;
  capacity: number;
  genderType: string;
}

export const propertiesService = {
  // Properties
  async getAllProperties(page = 1, limit = 20, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    return apiService.getAllProperties();
  },

  async getPropertyById(id: string) {
    // We'll need to add this method to ApiService
    return apiService.getAllProperties(); // Temporary fix
  },

  async createProperty(data: CreatePropertyData) {
    return apiService.createProperty(data);
  },

  async updateProperty(id: string, data: Partial<CreatePropertyData>) {
    return apiService.updateProperty(id, data);
  },

  async deleteProperty(id: string) {
    return apiService.deleteProperty(id);
  },

  async updatePropertyStatus(id: string, status: string, isActive?: boolean) {
    // We'll need to add this method to ApiService
    return apiService.getAllProperties(); // Temporary fix
  },

  // Categories
  async getAllCategories() {
    return apiService.getAllCategories();
  },

  async createCategory(data: CreateCategoryData) {
    return apiService.createCategory(data);
  },

  async updateCategory(id: string, data: Partial<CreateCategoryData>) {
    // We'll need to add this method to ApiService
    return apiService.getAllCategories(); // Temporary fix
  },

  async deleteCategory(id: string) {
    // We'll need to add this method to ApiService
    return apiService.getAllCategories(); // Temporary fix
  },

  // Room Types
  async getAllRoomTypes() {
    return apiService.getAllRoomTypes();
  },

  async createRoomType(data: CreateRoomTypeData) {
    return apiService.createRoomType(data);
  },

  async updateRoomType(id: string, data: Partial<CreateRoomTypeData>) {
    // We'll need to add this method to ApiService
    return apiService.getAllRoomTypes(); // Temporary fix
  },

  async deleteRoomType(id: string) {
    // We'll need to add this method to ApiService
    return apiService.getAllRoomTypes(); // Temporary fix
  }
}; 