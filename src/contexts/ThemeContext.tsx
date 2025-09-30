import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDayTime: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isDayTime, setIsDayTime] = useState(true);
  const [, setManualOverride] = useState<{
    theme: Theme;
    timestamp: number;
  } | null>(null);

  const checkIsDayTime = () => {
    const currentHour = new Date().getHours();
    return currentHour >= 6 && currentHour < 18;
  };

  const setThemeByTime = () => {
    const dayTime = checkIsDayTime();
    setIsDayTime(dayTime);
    const newTheme = dayTime ? 'light' : 'dark';
    setTheme(newTheme);
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    
    localStorage.setItem('hosfind-theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Set manual override with timestamp
    const override = {
      theme: newTheme as Theme,
      timestamp: Date.now()
    };
    setManualOverride(override);
    localStorage.setItem('hosfind-theme-override', JSON.stringify(override));
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('hosfind-theme', newTheme);
  };

  const checkManualOverride = () => {
    const overrideData = localStorage.getItem('hosfind-theme-override');
    if (overrideData) {
      try {
        const override = JSON.parse(overrideData);
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
        
        // Check if override is still valid (within 10 minutes)
        if (now - override.timestamp < tenMinutes) {
          setManualOverride(override);
          setTheme(override.theme);
          setIsDayTime(override.theme === 'light');
          return true;
        } else {
          // Override expired, remove it
          localStorage.removeItem('hosfind-theme-override');
          setManualOverride(null);
          return false;
        }
      } catch (error) {
        console.error('Error parsing theme override:', error);
        localStorage.removeItem('hosfind-theme-override');
        setManualOverride(null);
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    // Check for manual override first
    const hasOverride = checkManualOverride();
    
    if (!hasOverride) {
      setThemeByTime();
    }

    const checkTime = () => {
      // Only apply time-based theme if no valid manual override exists
      if (!checkManualOverride()) {
        setThemeByTime();
      }
    };

    // Check every minute
    const interval = setInterval(checkTime, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDayTime }}>
      {children}
    </ThemeContext.Provider>
  );
}; 