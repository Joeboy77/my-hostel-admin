import { apiService } from './api';

export interface Booking {
  id: string;
  userId: string;
  propertyId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate?: string | null;
  totalAmount: string;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentReference?: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    name: string;
    location: string;
    city: string;
  };
  roomType?: {
    id: string;
    name: string;
    price: number;
    currency: string;
    capacity: number;
  };
  user?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
}

export interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: string;
}

export interface BookingFilters {
  page?: number;
  limit?: number;
  status?: string;
  propertyId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface BookingListResponse {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class BookingsService {
  async getAllBookings(filters: BookingFilters = {}): Promise<BookingListResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/bookings/admin/all?${queryParams.toString()}`;
    const response = await apiService.get<BookingListResponse>(endpoint);
    return response.data!;
  }

  async getBookingStats(): Promise<BookingStats> {
    const response = await apiService.get<BookingStats>('/bookings/admin/stats');
    return response.data!;
  }

  async updateBookingStatus(bookingId: string, status: string, notes?: string): Promise<Booking> {
    const response = await apiService.patch<Booking>(`/bookings/admin/${bookingId}/status`, {
      status,
      notes,
    });
    return response.data!;
  }

  async getBookingById(bookingId: string): Promise<Booking> {
    const response = await apiService.get<Booking>(`/bookings/${bookingId}`);
    return response.data!;
  }
}

export const bookingsService = new BookingsService();