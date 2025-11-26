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
  async getAllProperties() {
    return apiService.getAllProperties();
  },

  async getPropertyById(_id: string) {
    // We'll need to add this method to ApiService
    return apiService.getAllProperties(); // Temporary fix
  },

  async createProperty(data: CreatePropertyData) {
    return apiService.createProperty(data);
  },

  async updateProperty(_id: string, _data: Partial<CreatePropertyData>) {
    return apiService.updateProperty(_id, _data);
  },

  async deleteProperty(_id: string) {
    return apiService.deleteProperty(_id);
  },

  async updatePropertyStatus(_id: string, _status: string, _isActive?: boolean) {
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

  async updateCategory(_id: string, _data: Partial<CreateCategoryData>) {
    // We'll need to add this method to ApiService
    return apiService.getAllCategories(); // Temporary fix
  },

  async deleteCategory(_id: string) {
    return apiService.deleteCategory(_id);
  },

  // Room Types
  async getAllRoomTypes() {
    return apiService.getAllRoomTypes();
  },

  async createRoomType(data: CreateRoomTypeData) {
    return apiService.createRoomType(data);
  },

  async updateRoomType(_id: string, _data: Partial<CreateRoomTypeData>) {
    return apiService.getAllRoomTypes();
  },

  async deleteRoomType(_id: string) {
    return apiService.deleteRoomType(_id);
  }
}; 