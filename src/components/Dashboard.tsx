import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, Heart, Bell, TrendingUp, Activity,
  Database, Clock, CheckCircle, AlertCircle, RefreshCw,
  BarChart3, LineChart, PieChart
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';
import Sidebar from './Sidebar';
import MobileMenuButton from './MobileMenuButton';
import { APP_CONFIG } from '../config/env';
import {
  PropertiesByCategoryChart,
  UserRegistrationTrendChart,
  PropertyCreationTrendChart,
  SystemMetricsRadarChart,
  PropertyStatusRadialChart
} from './charts';

interface DashboardStats {
  summary: {
    totalUsers: number;
    totalAdmins: number;
    activeUsers: number;
    totalProperties: number;
    activeProperties: number;
    featuredProperties: number;
    totalCategories: number;
    totalLikes: number;
    totalNotifications: number;
    unreadNotifications: number;
  };
  recentActivity: {
    newUsers: number;
    newProperties: number;
  };
  charts: {
    propertiesByCategory: Array<{ categoryName: string; count: string }>;
    userRegistrationTrend: Array<{ date: string; count: string }>;
    propertyCreationTrend: Array<{ date: string; count: string }>;
    topPropertiesByLikes: Array<{ propertyName: string; likeCount: string }>;
  };
  system: {
    status: string;
    lastBackup: string;
    databaseSize: string;
    uptime: number;
  };
}

const Dashboard: React.FC = () => {
  const { isDayTime } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.getDashboardStats();
      if (response.success && response.data) {
        // Transform the backend data to match frontend interface
        const backendData = response.data as any;
        const transformedData: DashboardStats = {
          summary: backendData.summary,
          recentActivity: {
            newUsers: backendData.recentActivity?.recentUsers || 0,
            newProperties: backendData.recentActivity?.recentProperties || 0
          },
          charts: {
            propertiesByCategory: backendData.analytics?.propertiesByCategory?.map((item: any) => ({
              categoryName: item.categoryName,
              count: item.propertyCount.toString()
            })) || [],
            userRegistrationTrend: backendData.analytics?.dailyUserRegistrations?.map((item: any) => ({
              date: item.date,
              count: item.userCount.toString()
            })) || [],
            propertyCreationTrend: [], // Not provided by backend yet
            topPropertiesByLikes: backendData.analytics?.topPropertiesByLikes?.map((item: any) => ({
              propertyName: item.propertyName,
              likeCount: item.likeCount.toString()
            })) || []
          },
          system: {
            status: 'Online',
            lastBackup: '2025-08-25',
            databaseSize: '2.5 MB',
            uptime: 86400
          }
        };
        console.log('🔍 [DASHBOARD] Transformed data:', transformedData);
        console.log('🔍 [DASHBOARD] Properties by category:', transformedData.charts.propertiesByCategory);
        setStats(transformedData);
      } else {
        setError(response.message || 'Failed to fetch dashboard stats');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center mx-auto space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

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
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Welcome to {APP_CONFIG.NAME} - {isDayTime ? 'Day' : 'Night'} Mode
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <button 
                onClick={fetchDashboardStats}
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
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Users Card */}
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{stats?.summary?.totalUsers?.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.summary?.activeUsers || '0'} active
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Properties Card */}
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold text-foreground">{stats?.summary?.totalProperties?.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.summary?.featuredProperties || '0'} featured
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Likes Card */}
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
                <p className="text-2xl font-bold text-foreground">{stats?.summary?.totalLikes?.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Engagement metric
                </p>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notifications</p>
                <p className="text-2xl font-bold text-foreground">{stats?.summary?.totalNotifications?.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.summary?.unreadNotifications || '0'} unread
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <Bell className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Recent Activity (7 days)
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-foreground">New Users</span>
                </div>
                <span className="text-lg font-semibold text-foreground">{stats?.recentActivity?.newUsers || '0'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-green-600" />
                  <span className="text-foreground">New Properties</span>
                </div>
                <span className="text-lg font-semibold text-foreground">{stats?.recentActivity?.newProperties || '0'}</span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-primary" />
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground">Status</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">{stats?.system?.status || 'Unknown'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">Database Size</span>
                <span className="text-sm text-muted-foreground">{stats?.system?.databaseSize || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">Uptime</span>
                <span className="text-sm text-muted-foreground">
                  {stats?.system?.uptime ? `${Math.floor(stats.system.uptime / 3600)}h ${Math.floor((stats.system.uptime % 3600) / 60)}m` : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Properties by Category Chart */}
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <PropertiesByCategoryChart data={stats?.charts?.propertiesByCategory || []} />
          </div>
          
          {/* User Registration Trend Chart */}
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <UserRegistrationTrendChart data={stats?.charts?.userRegistrationTrend || []} />
          </div>
          
          {/* Property Creation Trend Chart */}
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <PropertyCreationTrendChart data={stats?.charts?.propertyCreationTrend || []} />
          </div>
          
          {/* System Metrics Radar Chart */}
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <SystemMetricsRadarChart 
              data={{
                users: stats?.summary?.totalUsers || 0,
                properties: stats?.summary?.totalProperties || 0,
                categories: stats?.summary?.totalCategories || 0,
                likes: stats?.summary?.totalLikes || 0,
                notifications: stats?.summary?.totalNotifications || 0,
              }} 
            />
          </div>
          
          {/* Property Status Radial Chart */}
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <PropertyStatusRadialChart 
              data={{
                active: stats?.summary?.activeProperties || 0,
                inactive: (stats?.summary?.totalProperties || 0) - (stats?.summary?.activeProperties || 0),
                maintenance: 0, // We can add this to backend later
                booked: 0, // We can add this to backend later
              }} 
            />
          </div>
          
          {/* Top Properties by Likes */}
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-primary" />
              Top Properties by Likes
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats?.charts?.topPropertiesByLikes?.length ? (
                stats.charts.topPropertiesByLikes.map((property, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="text-foreground font-medium truncate">{property.propertyName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-foreground font-semibold">{property.likeCount}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No likes data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
};

export default Dashboard; 