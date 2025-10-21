import { api } from './axios.config';
import { Company } from '../../types';

export const companiesAPI = {
  // Получить все компании
  getAll: async (): Promise<Company[]> => {
    const response = await api.get('/companies');
    return response.data;
  },

  // Получить компанию по ID
  getById: async (id: number): Promise<Company> => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  // Создать новую компанию
  create: async (data: Partial<Company>): Promise<Company> => {
    const response = await api.post('/companies', data);
    return response.data;
  },

  // Обновить компанию
  update: async (id: number, data: Partial<Company>): Promise<Company> => {
    const response = await api.put(`/companies/${id}`, data);
    return response.data;
  },

  // Удалить компанию
  delete: async (id: number): Promise<void> => {
    await api.delete(`/companies/${id}`);
  },

  // Активировать компанию
  activate: async (id: number): Promise<Company> => {
    const response = await api.put(`/companies/${id}/activate`);
    return response.data;
  },

  // Деактивировать компанию
  deactivate: async (id: number): Promise<Company> => {
    const response = await api.put(`/companies/${id}/deactivate`);
    return response.data;
  },

  // Получить отделы компании
  getDepartments: async (id: number): Promise<any[]> => {
    const response = await api.get(`/companies/${id}/departments`);
    return response.data;
  },

  // Получить сотрудников компании
  getEmployees: async (id: number): Promise<any[]> => {
    const response = await api.get(`/companies/${id}/employees`);
    return response.data;
  },
};