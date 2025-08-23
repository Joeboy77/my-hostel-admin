import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home, Building2, Users, Bell, Settings, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

const Dashboard: React.FC = () => {
  const { theme, toggleTheme, isDayTime } = useTheme();
  const { admin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border min-h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-foreground">HosFind Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome, {admin?.fullName}
            </p>
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {isDayTime ? 'Day Mode' : 'Night Mode'}
              </span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-accent transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <nav className="px-4 flex-1">
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Building2 className="w-5 h-5" />
                  <span>Properties</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Users className="w-5 h-5" />
                  <span>Users</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </a>
              </li>
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-card border-b border-border px-6 py-4">
            <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
          </header>

          {/* Content */}
          <main className="p-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h1 className="text-3xl font-bold text-foreground mb-4">HosFind Admin Dashboard</h1>
              <p className="text-muted-foreground text-lg">
                Welcome to the HosFind property management admin panel.
              </p>
              <p className="text-muted-foreground mt-2">
                This is where you'll manage properties, users, and system settings.
              </p>
              <div className="mt-4 p-4 bg-accent rounded-lg">
                <p className="text-accent-foreground text-sm">
                  <strong>Current Theme:</strong> {theme} mode ({isDayTime ? 'Daytime' : 'Nighttime'})
                </p>
                <p className="text-accent-foreground text-sm mt-1">
                  Theme automatically switches based on time: Light (6 AM - 6 PM), Dark (6 PM - 6 AM)
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
