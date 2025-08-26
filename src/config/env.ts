// Environment Configuration
export const ENV_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'HosFind Admin',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  IS_DEV: import.meta.env.NODE_ENV === 'development',
  IS_PROD: import.meta.env.NODE_ENV === 'production',
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: `${ENV_CONFIG.API_BASE_URL}/api`,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: ENV_CONFIG.APP_NAME,
  VERSION: ENV_CONFIG.APP_VERSION,
  DESCRIPTION: 'HosFind Property Management Admin Panel',
  ENVIRONMENT: ENV_CONFIG.APP_ENV,
} as const; 