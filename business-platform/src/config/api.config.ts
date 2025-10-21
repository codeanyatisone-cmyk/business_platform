// Production API Configuration
// Используем относительный путь для production (через nginx proxy)
// или абсолютный для development
const getApiUrl = () => {
  // Проверяем переменные окружения
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // В production используем относительный путь (nginx проксирует)
  if (process.env.NODE_ENV === 'production') {
    return '/api/v1';
  }
  
  // В development используем FastAPI бэкенд
  return 'http://localhost:3001/api/v1';
};

export const API_CONFIG = {
  baseURL: getApiUrl(),
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
  withCredentials: true, // Включаем cookies для аутентификации
  retryAttempts: parseInt(process.env.REACT_APP_API_RETRY_ATTEMPTS || '3'),
};

// Check if we're in production
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true';

console.log('🔧 API Configuration:', {
  baseURL: API_CONFIG.baseURL,
  isProduction: IS_PRODUCTION,
  useMockData: USE_MOCK_DATA,
  timeout: API_CONFIG.timeout,
  withCredentials: API_CONFIG.withCredentials
});

