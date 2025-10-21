import { api } from './axios.config';
import { Password, PasswordCategory } from '../../types';

export const passwordsApi = {
  // Получить все пароли
  async getPasswords(): Promise<Password[]> {
    const response = await api.get('/passwords');
    return response.data;
  },

  // Получить пароль по ID
  async getPassword(id: number): Promise<Password> {
    const response = await api.get(`/passwords/${id}`);
    return response.data;
  },

  // Создать новый пароль
  async createPassword(password: Partial<Password>): Promise<Password> {
    const response = await api.post('/passwords', password);
    return response.data;
  },

  // Обновить пароль
  async updatePassword(id: number, password: Partial<Password>): Promise<Password> {
    const response = await api.put(`/passwords/${id}`, password);
    return response.data;
  },

  // Удалить пароль
  async deletePassword(id: number): Promise<void> {
    await api.delete(`/passwords/${id}`);
  },

  // Получить пароли по категории
  async getPasswordsByCategory(categoryId: string): Promise<Password[]> {
    const response = await api.get(`/passwords/category/${categoryId}`);
    return response.data;
  },

  // Получить все категории паролей
  async getPasswordCategories(): Promise<PasswordCategory[]> {
    const response = await api.get('/password-categories');
    return response.data;
  },

  // Создать новую категорию
  async createPasswordCategory(category: Partial<PasswordCategory>): Promise<PasswordCategory> {
    const response = await api.post('/password-categories', category);
    return response.data;
  },

  // Обновить категорию
  async updatePasswordCategory(id: string, category: Partial<PasswordCategory>): Promise<PasswordCategory> {
    const response = await api.put(`/password-categories/${id}`, category);
    return response.data;
  },

  // Удалить категорию
  async deletePasswordCategory(id: string): Promise<void> {
    await api.delete(`/password-categories/${id}`);
  },

  // Получить пароли по типу (личные/общие)
  async getPasswordsByType(isPersonal: boolean): Promise<Password[]> {
    const passwords = await this.getPasswords();
    return passwords.filter(password => password.isPersonal === isPersonal);
  },

  // Поиск паролей
  async searchPasswords(query: string): Promise<Password[]> {
    const passwords = await this.getPasswords();
    const lowercaseQuery = query.toLowerCase();
    
    return passwords.filter(password => 
      password.name.toLowerCase().includes(lowercaseQuery) ||
      password.description?.toLowerCase().includes(lowercaseQuery) ||
      password.login.toLowerCase().includes(lowercaseQuery) ||
      password.category.toLowerCase().includes(lowercaseQuery) ||
      password.url?.toLowerCase().includes(lowercaseQuery)
    );
  }
};

