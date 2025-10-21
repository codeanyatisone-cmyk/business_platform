import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../../config/api.config';

// Создаем настроенный axios instance
export const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: API_CONFIG.withCredentials,
});

// Функция для retry запросов
const retryRequest = async (config: AxiosRequestConfig, retryCount = 0): Promise<AxiosResponse> => {
  try {
    return await api(config);
  } catch (error) {
    if (retryCount < API_CONFIG.retryAttempts && shouldRetry(error as AxiosError)) {
      console.log(`🔄 Retrying request (${retryCount + 1}/${API_CONFIG.retryAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return retryRequest(config, retryCount + 1);
    }
    throw error;
  }
};

// Проверяем, стоит ли повторить запрос
const shouldRetry = (error: AxiosError): boolean => {
  if (!error.response) return true; // Network error
  const status = error.response.status;
  return status >= 500 || status === 408 || status === 429; // Server errors, timeout, rate limit
};

// Автоматически добавляем токен к каждому запросу
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Добавляем timestamp для предотвращения кеширования
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Обработка ответов и ошибок
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method
    });

    if (error.response?.status === 401) {
      // Токен истек - очищаем localStorage и перенаправляем на логин
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Перенаправляем только если не на странице логина
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      // Доступ запрещен
      console.error('🚫 Access denied');
    } else if (error.response && error.response.status >= 500) {
      // Серверная ошибка
      console.error('🔥 Server error');
    } else if (!error.response) {
      // Сетевая ошибка
      console.error('🌐 Network error - check your connection');
    }

    return Promise.reject(error);
  }
);

// Экспортируем функцию для retry
export { retryRequest };

