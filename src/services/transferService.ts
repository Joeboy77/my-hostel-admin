import { apiService } from './api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Transfer {
  id: string;
  adminId: string;
  amount: number;
  currency: string;
  transferType: 'bank_account' | 'mobile_money' | 'paystack_account';
  recipientType: 'user' | 'external';
  recipientUserId?: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  bankCode?: string;
  bankName?: string;
  accountNumber?: string;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  paystackTransferCode?: string;
  paystackReference?: string;
  status: 'pending' | 'processing' | 'successful' | 'failed' | 'cancelled';
  reason?: string;
  failureReason?: string;
  transferFee: number;
  totalAmount: number;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  admin: {
    id: string;
    email: string;
    fullName: string;
  };
}

export interface TransferStats {
  totalTransfers: number;
  successfulTransfers: number;
  pendingTransfers: number;
  failedTransfers: number;
  totalAmount: number;
  totalFees: number;
}

export interface CreateTransferData {
  amount: number;
  currency?: string;
  transferType: 'bank_account' | 'mobile_money' | 'paystack_account';
  recipientType: 'user' | 'external';
  recipientUserId?: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  bankCode?: string;
  bankName?: string;
  accountNumber?: string;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  reason?: string;
}

export interface TransferFilters {
  page?: number;
  limit?: number;
  status?: string;
  transferType?: string;
  search?: string;
}

class TransferService {
  async getAllTransfers(filters: TransferFilters = {}): Promise<ApiResponse<{ transfers: Transfer[]; pagination: any }>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.transferType) params.append('transferType', filters.transferType);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/transfers?${queryString}` : '/admin/transfers';
    
    return apiService.get<{ transfers: Transfer[]; pagination: any }>(endpoint);
  }

  async getTransferStats(): Promise<ApiResponse<TransferStats>> {
    return apiService.get<TransferStats>('/admin/transfers/stats');
  }

  async getTransferById(id: string): Promise<ApiResponse<Transfer>> {
    return apiService.get<Transfer>(`/admin/transfers/${id}`);
  }

  async createTransfer(data: CreateTransferData): Promise<ApiResponse<Transfer>> {
    return apiService.post<Transfer>('/admin/transfers', data);
  }

  async cancelTransfer(id: string): Promise<ApiResponse<Transfer>> {
    return apiService.patch<Transfer>(`/admin/transfers/${id}/cancel`);
  }

  async getBanks(): Promise<ApiResponse<any[]>> {
    return apiService.get<any[]>('/admin/transfers/banks');
  }

  async verifyBankAccount(accountNumber: string, bankCode: string): Promise<ApiResponse<any>> {
    return apiService.post<any>('/admin/transfers/verify-bank', { accountNumber, bankCode });
  }
}

export const transferService = new TransferService();