import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  Users, 
  Bell, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Calendar
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { APP_CONFIG } from '../config/env';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { theme, toggleTheme, isDayTime } = useTheme();
  const { admin, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const navigationItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', active: location.pathname === '/dashboard' },
    { icon: Building2, label: 'Properties', href: '/properties', active: location.pathname === '/properties' },
    { icon: Users, label: 'Users', href: '/users', active: location.pathname === '/users' },
    { icon: Calendar, label: 'Bookings', href: '/bookings', active: location.pathname === '/bookings' },
    { icon: Bell, label: 'Notifications', href: '/notifications', active: location.pathname === '/notifications' },
    { icon: Settings, label: 'Settings', href: '/settings', active: location.pathname === '/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-card border-r border-border z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 lg:translate-x-0 lg:relative
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">{APP_CONFIG.NAME}</span>
          </div>
          
          {/* Mobile Close Button */}
          <button
            onClick={onToggle}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-foreground">
                {admin?.fullName?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {admin?.fullName || 'Admin User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {admin?.email || 'admin@hosfind.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="p-4 border-b border-border">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center space-x-3 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {isDayTime ? (
                <div className="w-4 h-4 bg-yellow-400 rounded-full" />
              ) : (
                <div className="w-4 h-4 bg-blue-400 rounded-full" />
              )}
            </div>
            <span className="text-sm font-medium">
              {isDayTime ? 'Day Mode' : 'Night Mode'}
            </span>
          </button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Auto-switches in 10 minutes
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      item.active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;