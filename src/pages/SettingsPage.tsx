import React, { useState, useEffect } from 'react';
import { 
  Settings, User, Save, Eye, EyeOff, 
  RefreshCw, AlertCircle, CheckCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MobileMenuButton from '../components/MobileMenuButton';
import apiService from '../services/api';

interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  lastLoginAt: string;
  createdAt: string;
}

interface AppSettings {
  appName: string;
  appVersion: string;
  environment: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
}

const SettingsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile settings
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // App settings
  const [appSettings, setAppSettings] = useState<AppSettings>({
    appName: 'HosFind Admin',
    appVersion: '1.0.0',
    environment: 'development',
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    requirePhoneVerification: false
  });

  useEffect(() => {
    loadProfile();
    loadAppSettings();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminProfile();
      if (response.success && response.data) {
        const profileData = response.data as AdminProfile;
        setProfile(profileData);
        setProfileForm({
          fullName: profileData.fullName,
          email: profileData.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const loadAppSettings = async () => {
    try {
      const response = await apiService.getAppSettings();
      if (response.success && response.data) {
        const settingsData = response.data as AppSettings;
        setAppSettings(settingsData);
      }
    } catch (error) {
      console.error('Error loading app settings:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      setSaving(true);
      const updateData: any = {};
      
      if (profileForm.fullName !== profile?.fullName) {
        updateData.fullName = profileForm.fullName;
      }
      if (profileForm.email !== profile?.email) {
        updateData.email = profileForm.email;
      }
      if (profileForm.currentPassword && profileForm.newPassword) {
        updateData.currentPassword = profileForm.currentPassword;
        updateData.newPassword = profileForm.newPassword;
      }

      const response = await apiService.updateAdminProfile(updateData);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        setProfileForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        await loadProfile(); // Reload profile to get updated data
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update profile' });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleAppSettingsUpdate = async () => {
    try {
      setSaving(true);
      const response = await apiService.updateAppSettings(appSettings);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'App settings updated successfully' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update app settings' });
      }
    } catch (error: any) {
      console.error('Error updating app settings:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update app settings' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'app', label: 'App Settings', icon: Settings }
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Profile Information</h3>
        
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h4 className="text-md font-medium text-foreground mb-4">Change Password</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter new password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {profile && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Account Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="text-foreground font-medium capitalize">{profile.role.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Login</p>
              <p className="text-foreground font-medium">
                {new Date(profile.lastLoginAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="text-foreground font-medium">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account ID</p>
              <p className="text-foreground font-medium font-mono text-sm">{profile.id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAppSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Application Settings</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                App Name
              </label>
              <input
                type="text"
                value={appSettings.appName}
                onChange={(e) => setAppSettings(prev => ({ ...prev, appName: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Environment
              </label>
              <input
                type="text"
                value={appSettings.environment}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-md font-medium text-foreground">System Controls</h4>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appSettings.maintenanceMode}
                  onChange={(e) => setAppSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-foreground">Maintenance Mode</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appSettings.allowRegistrations}
                  onChange={(e) => setAppSettings(prev => ({ ...prev, allowRegistrations: e.target.checked }))}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-foreground">Allow User Registrations</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appSettings.requireEmailVerification}
                  onChange={(e) => setAppSettings(prev => ({ ...prev, requireEmailVerification: e.target.checked }))}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-foreground">Require Email Verification</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appSettings.requirePhoneVerification}
                  onChange={(e) => setAppSettings(prev => ({ ...prev, requirePhoneVerification: e.target.checked }))}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-foreground">Require Phone Verification</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAppSettingsUpdate}
              disabled={saving}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'app':
        return renderAppSettingsTab();
      default:
        return renderProfileTab();
    }
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
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your account and application preferences</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-3 sm:p-4 lg:p-6">
          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-card border border-border rounded-lg mb-6">
            <div className="flex flex-wrap border-b border-border">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          ) : (
            renderTabContent()
          )}
        </main>
      </div>
    </div>
  );
};

export default SettingsPage; 