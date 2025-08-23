export interface Property {
  id: string;
  name: string;
  description: string;
  propertyType: string;
  location: string;
  city: string;
  price: number;
  currency: string;
  mainImageUrl: string;
  additionalImageUrls: string[];
  roomType: string;
  imageRoomTypes: string[];
  amenities: string[];
  contactInfo: {
    phone: string;
    email: string;
  };
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roomTypes?: RoomType[];
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  genderType: 'MALE' | 'FEMALE' | 'MIXED' | 'ANY';
  capacity: number;
  amenities: string[];
  imageUrl: string;
  propertyId: string;
  availableRooms: number;
  totalRooms: number;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  pushToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'NEW_PROPERTY' | 'PROPERTY_UPDATE' | 'PROMOTION' | 'SYSTEM';
  isRead: boolean;
  data?: any;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 