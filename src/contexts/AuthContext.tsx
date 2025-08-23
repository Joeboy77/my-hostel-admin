import React, { createContext, useContext, useState, useEffect } from 'react';

interface Admin {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (adminData: Admin, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  accessToken: string | null;
  refreshToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem('admin_access_token');
    const storedRefreshToken = localStorage.getItem('admin_refresh_token');
    const storedAdminData = localStorage.getItem('admin_data');

    if (storedAccessToken && storedRefreshToken && storedAdminData) {
      try {
        const adminData = JSON.parse(storedAdminData);
        setAdmin(adminData);
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored admin data:', error);
        logout();
      }
    }
  }, []);

  const login = (adminData: Admin, accessToken: string, refreshToken: string) => {
    setAdmin(adminData);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setIsAuthenticated(true);
    
    localStorage.setItem('admin_access_token', accessToken);
    localStorage.setItem('admin_refresh_token', refreshToken);
    localStorage.setItem('admin_data', JSON.stringify(adminData));
  };

  const logout = () => {
    setAdmin(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_data');
  };

  return (
    <AuthContext.Provider value={{
      admin,
      isAuthenticated,
      login,
      logout,
      accessToken,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 