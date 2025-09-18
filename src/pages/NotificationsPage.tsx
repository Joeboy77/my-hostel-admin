import React, { useState, useEffect } from 'react';
import { 
  Bell, Search, Filter, Plus, RefreshCw, Trash2, CheckCircle, 
  Calendar, AlertCircle, Target, XCircle, Send
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MobileMenuButton from '../components/MobileMenuButton';
import apiService from '../services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'new_property' | 'property_update' | 'system' | 'promotion';
  isRead: boolean;
  data?: any;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  notificationsByType: Array<{
    type: string;
    count: string;
  }>;
  recentNotifications: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const NotificationsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterRead, setFilterRead] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  
  // Create notification modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    message: '',
    type: 'system' as string,
    targetUsers: 'all' as 'all' | 'verified'
  });

  // Delete confirmation modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string>('');

  useEffect(() => {
    fetchNotifications();
    fetchNotificationStats();
  }, [pagination.page, searchTerm, filterType, filterRead]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getAllNotifications(
        pagination.page, 
        pagination.limit, 
        filterType || undefined, 
        filterRead || undefined
      );
      
      if (response.success && response.data) {
        const data = response.data as any;
        setNotifications(data.notifications || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0
        }));
      } else {
        setError(response.message || 'Failed to fetch notifications');
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const response = await apiService.getNotificationStats();
      if (response.success && response.data) {
        setStats(response.data as NotificationStats);
      }
    } catch (err) {
      console.error('Error fetching notification stats:', err);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await apiService.createNotification(createForm);
      if (response.success) {
        setCreateModalOpen(false);
        setCreateForm({
          title: '',
          message: '',
          type: 'system',
          targetUsers: 'all'
        });
        fetchNotifications();
        fetchNotificationStats();
      }
    } catch (err: any) {
      console.error('Error creating notification:', err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    setNotificationToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteNotification = async () => {
    if (!notificationToDelete) return;

    try {
      const response = await apiService.deleteNotification(notificationToDelete);
      if (response.success) {
        setNotifications(prev => prev.filter(notification => notification.id !== notificationToDelete));
        fetchNotificationStats();
        setDeleteModalOpen(false);
        setNotificationToDelete('');
      }
    } catch (err: any) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await apiService.markNotificationAsRead(id);
      if (response.success) {
        setNotifications(prev => prev.map(notification => 
          notification.id === id ? { ...notification, isRead: true } : notification
        ));
        fetchNotificationStats();
      }
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_property':
        return <Bell className="w-4 h-4 text-green-600" />;
      case 'property_update':
        return <Bell className="w-4 h-4 text-blue-600" />;
      case 'promotion':
        return <Bell className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'new_property':
        return 'New Property';
      case 'property_update':
        return 'Property Update';
      case 'promotion':
        return 'Promotion';
      default:
        return 'System';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <MobileMenuButton onClick={() => setSidebarOpen(!sidebarOpen)} />
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Notifications</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage system notifications</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={fetchNotifications}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                title="Refresh notifications"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCreateModalOpen(true)}
                className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Send Notification</span>
                <span className="sm:hidden">Send</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{stats.totalNotifications}</p>
                  </div>
                  <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Unread</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{stats.unreadNotifications}</p>
                  </div>
                  <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Recent (24h)</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{stats.recentNotifications}</p>
                  </div>
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Types</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{stats.notificationsByType.length}</p>
                  </div>
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
            <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 sm:px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                >
                  <option value="">All Types</option>
                  <option value="new_property">New Property</option>
                  <option value="property_update">Property Update</option>
                  <option value="system">System</option>
                  <option value="promotion">Promotion</option>
                </select>
                
                <select
                  value={filterRead}
                  onChange={(e) => setFilterRead(e.target.value)}
                  className="px-3 sm:px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                >
                  <option value="">All Status</option>
                  <option value="true">Read</option>
                  <option value="false">Unread</option>
                </select>
                
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
              </div>
            </form>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg">
              <div className="p-4 sm:p-6 border-b border-border">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">All Notifications</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Showing {notifications.length} of {pagination.total} notifications
                </p>
              </div>
              
              {notifications.length > 0 ? (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 sm:p-6 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="mt-1">
                            {getTypeIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-medium text-foreground text-sm sm:text-base break-words">{notification.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                notification.isRead 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {notification.isRead ? 'Read' : 'Unread'}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                                {getTypeLabel(notification.type)}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2 break-words">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-end sm:justify-start space-x-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-lg font-medium mb-2">No notifications found</p>
                  <p className="text-muted-foreground text-sm">Notifications will appear here when they are created.</p>
                </div>
              )}
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="p-4 sm:p-6 border-t border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                      Page {pagination.page} of {pagination.pages}
                    </p>
                    <div className="flex items-center justify-center sm:justify-end space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="px-3 py-1 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors text-sm"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="px-3 py-1 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Create Notification Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-sm sm:max-w-md">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Send Notification</h2>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateNotification} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                  placeholder="Enter notification title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={createForm.message}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                  placeholder="Enter notification message"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type
                </label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                >
                  <option value="system">System</option>
                  <option value="new_property">New Property</option>
                  <option value="property_update">Property Update</option>
                  <option value="promotion">Promotion</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Target Users
                </label>
                <select
                  value={createForm.targetUsers}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, targetUsers: e.target.value as 'all' | 'verified' }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                >
                  <option value="all">All Users</option>
                  <option value="verified">Verified Users Only</option>
                </select>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Notification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-sm sm:max-w-md">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Delete Notification</h2>
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setNotificationToDelete('');
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <p className="text-foreground mb-6 text-sm sm:text-base">
                Are you sure you want to delete this notification? This action cannot be undone.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setNotificationToDelete('');
                  }}
                  className="w-full sm:w-auto px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteNotification}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage; 