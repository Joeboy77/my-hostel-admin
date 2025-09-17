import React, { useState, useEffect } from 'react';
import { Send, Plus, Eye, X, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MobileMenuButton from '../components/MobileMenuButton';
import { transferService } from '../services/transferService';
import type { Transfer, TransferStats, CreateTransferData } from '../services/transferService';

const TransfersPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [stats, setStats] = useState<TransferStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    transferType: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Form state for creating transfers
  const [formData, setFormData] = useState<CreateTransferData>({
    amount: 0,
    currency: 'GHS',
    transferType: 'bank_account',
    recipientType: 'external',
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    bankCode: '',
    bankName: '',
    accountNumber: '',
    mobileMoneyProvider: '',
    mobileMoneyNumber: '',
    reason: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transfersResponse, statsResponse] = await Promise.all([
        transferService.getAllTransfers(filters),
        transferService.getTransferStats()
      ]);

      setTransfers(transfersResponse.data?.transfers || []);
      setPagination(transfersResponse.data?.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      setStats(statsResponse.data || null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: Record<string, string> = {};
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    if (!formData.recipientName.trim()) {
      errors.recipientName = 'Recipient name is required';
    }
    if (!formData.recipientEmail.trim()) {
      errors.recipientEmail = 'Recipient email is required';
    }
    if (formData.transferType === 'bank_account' && (!formData.bankCode || !formData.accountNumber)) {
      errors.bankDetails = 'Bank code and account number are required for bank transfers';
    }
    if (formData.transferType === 'mobile_money' && (!formData.mobileMoneyProvider || !formData.mobileMoneyNumber)) {
      errors.mobileMoneyDetails = 'Mobile money provider and number are required for mobile money transfers';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await transferService.createTransfer(formData);
      setShowCreateModal(false);
      setFormData({
        amount: 0,
        currency: 'GHS',
        transferType: 'bank_account',
        recipientType: 'external',
        recipientName: '',
        recipientEmail: '',
        recipientPhone: '',
        bankCode: '',
        bankName: '',
        accountNumber: '',
        mobileMoneyProvider: '',
        mobileMoneyNumber: '',
        reason: ''
      });
      setFormErrors({});
      fetchData();
    } catch (error) {
      console.error('Error creating transfer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelTransfer = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this transfer?')) {
      try {
        await transferService.cancelTransfer(id);
        fetchData();
      } catch (error) {
        console.error('Error cancelling transfer:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      case 'pending': return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30';
      case 'processing': return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30';
      case 'failed': return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30';
      case 'cancelled': return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30';
      default: return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <AlertCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTransferTypeLabel = (type: string) => {
    switch (type) {
      case 'bank_account': return 'Bank Account';
      case 'mobile_money': return 'Mobile Money';
      case 'paystack_account': return 'Paystack Account';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <MobileMenuButton onClick={() => setSidebarOpen(!sidebarOpen)} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Money Transfers</h1>
                <p className="text-muted-foreground mt-1">Send money to users and external recipients</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Money</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="space-y-6">

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Transfers</h3>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{stats.totalTransfers}</p>
                    </div>
                    <Send className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Successful</h3>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{stats.successfulTransfers}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</h3>
                      <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 mt-2">{stats.pendingTransfers}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Amount</h3>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">₵{stats.totalAmount.toFixed(2)}</p>
                    </div>
                    <div className="text-2xl">💰</div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Filter Transfers</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Search</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    placeholder="Search by name, email, or phone"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background text-foreground"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="successful">Successful</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Transfer Type</label>
                  <select
                    value={filters.transferType}
                    onChange={(e) => setFilters({ ...filters, transferType: e.target.value, page: 1 })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background text-foreground"
                  >
                    <option value="">All Types</option>
                    <option value="bank_account">Bank Account</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="paystack_account">Paystack Account</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({ page: 1, limit: 20, status: '', transferType: '', search: '' })}
                    className="w-full px-4 py-2 text-sm font-medium text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Transfers Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Recent Transfers</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Recipient
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transfers.map((transfer) => (
                      <tr key={transfer.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-semibold text-sm">
                                {transfer.recipientName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-foreground">{transfer.recipientName}</div>
                              <div className="text-sm text-muted-foreground">{transfer.recipientEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-foreground">
                            {transfer.currency}{transfer.amount.toFixed(2)}
                          </div>
                          {transfer.transferFee > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Fee: {transfer.currency}{transfer.transferFee.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {getTransferTypeLabel(transfer.transferType)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                            {getStatusIcon(transfer.status)}
                            <span className="ml-1 capitalize">{transfer.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(transfer.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedTransfer(transfer)}
                              className="text-primary hover:text-primary/80 hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {(transfer.status === 'pending' || transfer.status === 'processing') && (
                              <button
                                onClick={() => handleCancelTransfer(transfer.id)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/20">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 text-sm border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 text-sm border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Transfer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-foreground mb-4">Send Money</h2>
            
            <form onSubmit={handleCreateTransfer} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    formErrors.amount ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="Enter amount"
                />
                {formErrors.amount && <p className="mt-1 text-sm text-red-500">{formErrors.amount}</p>}
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="GHS">GHS (Ghana Cedi)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>

              {/* Transfer Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Transfer Type *</label>
                <select
                  value={formData.transferType}
                  onChange={(e) => setFormData({ ...formData, transferType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="bank_account">Bank Account</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="paystack_account">Paystack Account</option>
                </select>
              </div>

              {/* Recipient Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Recipient Type *</label>
                <select
                  value={formData.recipientType}
                  onChange={(e) => setFormData({ ...formData, recipientType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="external">External Recipient</option>
                  <option value="user">System User</option>
                </select>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Recipient Name *</label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      formErrors.recipientName ? 'border-red-500' : 'border-border'
                    }`}
                    placeholder="Enter recipient name"
                  />
                  {formErrors.recipientName && <p className="mt-1 text-sm text-red-500">{formErrors.recipientName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Recipient Email *</label>
                  <input
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      formErrors.recipientEmail ? 'border-red-500' : 'border-border'
                    }`}
                    placeholder="Enter recipient email"
                  />
                  {formErrors.recipientEmail && <p className="mt-1 text-sm text-red-500">{formErrors.recipientEmail}</p>}
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.recipientPhone}
                  onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Bank Account Details */}
              {formData.transferType === 'bank_account' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Bank Code *</label>
                    <input
                      type="text"
                      value={formData.bankCode}
                      onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter bank code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Account Number *</label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter account number"
                    />
                  </div>
                </div>
              )}

              {/* Mobile Money Details */}
              {formData.transferType === 'mobile_money' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Provider *</label>
                    <select
                      value={formData.mobileMoneyProvider}
                      onChange={(e) => setFormData({ ...formData, mobileMoneyProvider: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select Provider</option>
                      <option value="MTN">MTN Mobile Money</option>
                      <option value="Vodafone">Vodafone Cash</option>
                      <option value="AirtelTigo">AirtelTigo Money</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Mobile Number *</label>
                    <input
                      type="tel"
                      value={formData.mobileMoneyNumber}
                      onChange={(e) => setFormData({ ...formData, mobileMoneyNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter mobile number"
                    />
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter transfer reason (optional)"
                  rows={3}
                />
              </div>

              {/* Error Messages */}
              {formErrors.bankDetails && (
                <p className="text-sm text-red-500">{formErrors.bankDetails}</p>
              )}
              {formErrors.mobileMoneyDetails && (
                <p className="text-sm text-red-500">{formErrors.mobileMoneyDetails}</p>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Sending...' : 'Send Money'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Details Modal */}
      {selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-foreground mb-4">Transfer Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Recipient</label>
                  <p className="text-foreground">{selectedTransfer.recipientName}</p>
                  <p className="text-sm text-muted-foreground">{selectedTransfer.recipientEmail}</p>
                  {selectedTransfer.recipientPhone && (
                    <p className="text-sm text-muted-foreground">{selectedTransfer.recipientPhone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Amount</label>
                  <p className="text-foreground font-semibold">
                    {selectedTransfer.currency}{selectedTransfer.amount.toFixed(2)}
                  </p>
                  {selectedTransfer.transferFee > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Fee: {selectedTransfer.currency}{selectedTransfer.transferFee.toFixed(2)}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Total: {selectedTransfer.currency}{selectedTransfer.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-foreground">{getTransferTypeLabel(selectedTransfer.transferType)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTransfer.status)}`}>
                    {selectedTransfer.status}
                  </span>
                </div>
              </div>

              {selectedTransfer.reason && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Reason</label>
                  <p className="text-foreground">{selectedTransfer.reason}</p>
                </div>
              )}

              {selectedTransfer.failureReason && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Failure Reason</label>
                  <p className="text-red-600">{selectedTransfer.failureReason}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-foreground">{new Date(selectedTransfer.createdAt).toLocaleString()}</p>
                </div>
                {selectedTransfer.processedAt && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Processed</label>
                    <p className="text-foreground">{new Date(selectedTransfer.processedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setSelectedTransfer(null)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransfersPage;