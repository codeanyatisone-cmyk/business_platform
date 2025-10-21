import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api/axios.config';
import { USE_MOCK_DATA, API_CONFIG } from '../config/api.config';

// Log configuration on startup (already logged in api.config.ts)

interface Employee {
  id: number;
  name: string;
  position: string;
  avatar?: string;
  department?: string;
  [key: string]: any;
}

interface User {
  id: number;
  email: string;
  role: string;
  employee: Employee;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  position: string;
  department: string;
  phone?: string;
  birthDate: string;
  hireDate: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Проверяем токен при загрузке
  useEffect(() => {
    if (USE_MOCK_DATA) {
      // В режиме mock автоматически логиним пользователя
      const mockUser = localStorage.getItem('mock_user');
      if (mockUser) {
        setUser(JSON.parse(mockUser));
      }
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (token) {
      // Проверяем валидность токена
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await api.get('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setUser(response.data);
    } catch (error) {
      // Токен невалиден - удаляем
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (USE_MOCK_DATA) {
      // Mock login
      const mockUser: User = {
        id: 1,
        email: email,
        role: 'admin',
        employee: {
          id: 1,
          name: 'Admin User',
          position: 'Administrator',
          avatar: '👤',
          department: 'Management',
        },
      };

      console.log('✅ Mock login successful');
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { access_token } = response.data;

      // Сохраняем токен
      localStorage.setItem('access_token', access_token);

      // Загружаем профиль пользователя
      const profileRes = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      setUser(profileRes.data);
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw new Error(
        error.response?.data?.message || 'Ошибка входа. Проверьте email и пароль.'
      );
    }
  };

  const register = async (data: RegisterData) => {
    if (USE_MOCK_DATA) {
      // Mock registration
      const mockUser: User = {
        id: Date.now(),
        email: data.email,
        role: 'user',
        employee: {
          id: Date.now(),
          name: data.name,
          position: data.position,
          avatar: '👤',
          department: data.department,
        },
      };

      console.log('✅ Mock registration successful');
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return;
    }

    try {
      const response = await api.post('/auth/register', data);

      const { access_token } = response.data;

      console.log('✅ Registration successful');

      // Сохраняем токен
      localStorage.setItem('access_token', access_token);

      // Загружаем профиль пользователя
      const profileRes = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      setUser(profileRes.data);
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw new Error(
        error.response?.data?.message || 'Ошибка регистрации. Попробуйте другой email.'
      );
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('mock_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

