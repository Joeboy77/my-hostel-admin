import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Eye, Trash2, RefreshCw,
  ChevronLeft, ChevronRight, AlertCircle, LogIn,
  UserCheck, Activity, Mail, Phone, MapPin, UserX
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileMenuButton from '../components/MobileMenuButton';
import ViewItemModal from '../components/ViewItemModal';
import apiService from '../services/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [pagination.page, searchTerm, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getAllUsers(pagination.page, pagination.limit, searchTerm);
      
      if (response.success && response.data) {
        const data = response.data as any;
        setUsers(data.users || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0
        }));
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await apiService.getUserStats();
      if (response.success && response.data) {
        setStats(response.data as UserStats);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const response = await apiService.getUserDetails(userId);
      if (response.success && response.data) {
        setSelectedUserId(userId);
        setViewModalOpen(true);
      }
    } catch (err: any) {
      console.error('Error fetching user details:', err);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await apiService.updateUserStatus(userId, !currentStatus);
      if (response.success) {
        // Update the user in the local state
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        ));
        // Refresh stats
        fetchUserStats();
      }
    } catch (err: any) {
      console.error('Error updating user status:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiService.deleteUser(userId);
      if (response.success) {
        setUsers(prev => prev.filter(user => user.id !== userId));
        fetchUserStats();
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const filteredUsers = users.filter(user => {
    if (filterStatus === 'active' && !user.isActive) return false;
    if (filterStatus === 'inactive' && user.isActive) return false;
    return true;
  });

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
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <MobileMenuButton onClick={() => setSidebarOpen(!sidebarOpen)} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Users Management</h1>
                <p className="text-muted-foreground mt-1">
                  Manage user accounts and monitor user activity
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => { fetchUsers(); fetchUserStats(); }}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-6 space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold text-foreground">{stats.activeUsers.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>



              <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                    <p className="text-2xl font-bold text-foreground">{stats.newUsersThisMonth.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                    <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </form>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>


              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
                <p className="text-destructive">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                  <button 
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry</span>
                  </button>
                  <button 
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => {
                          return (
                            <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                      {user.fullName.charAt(0).toUpperCase()}
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-foreground">
                                      {user.fullName}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      ID: {user.id.slice(0, 8)}...
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-foreground">
                                  <div className="flex items-center space-x-1">
                                    <Mail className="w-3 h-3 text-muted-foreground" />
                                    <span>{user.email}</span>
                                  </div>
                                  <div className="flex items-center space-x-1 mt-1">
                                    <Phone className="w-3 h-3 text-muted-foreground" />
                                    <span>{user.phoneNumber}</span>
                                  </div>
                                  {user.location && (
                                    <div className="flex items-center space-x-1 mt-1">
                                      <MapPin className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">{user.location}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.isActive 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                {formatDate(user.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleViewUser(user.id)}
                                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                    title="View details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusToggle(user.id, user.isActive)}
                                    className={`p-1 transition-colors ${
                                      user.isActive 
                                        ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300' 
                                        : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
                                    }`}
                                    title={user.isActive ? 'Deactivate user' : 'Activate user'}
                                  >
                                    {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                    title="Delete user"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center">
                            <div className="text-muted-foreground">
                              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p className="text-lg font-medium">No users found</p>
                              <p className="text-sm">Try adjusting your search or filters</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="px-6 py-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} users
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-foreground">
                          Page {pagination.page} of {pagination.pages}
                        </span>
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.pages}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* View User Modal */}
      <ViewItemModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        type="user"
        itemId={selectedUserId}
      />
    </div>
  );
};

export default UsersPage; 