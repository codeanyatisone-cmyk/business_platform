import { api } from './axios.config';
import { Department } from '../../types';

export const departmentsAPI = {
  // Получить все отделы
  getAll: async (companyId?: number): Promise<Department[]> => {
    const url = companyId ? `/departments?companyId=${companyId}` : '/departments';
    const response = await api.get(url);
    return response.data;
  },

  // Получить отдел по ID
  getById: async (id: number): Promise<Department> => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  // Создать новый отдел
  create: async (data: Partial<Department>): Promise<Department> => {
    const response = await api.post('/departments', data);
    return response.data;
  },

  // Обновить отдел
  update: async (id: number, data: Partial<Department>): Promise<Department> => {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },

  // Удалить отдел
  delete: async (id: number): Promise<void> => {
    await api.delete(`/departments/${id}`);
  },

  // Получить сотрудников отдела
  getEmployees: async (id: number): Promise<any[]> => {
    const response = await api.get(`/departments/${id}/employees`);
    return response.data;
  },

  // Получить иерархию отделов
  getHierarchy: async (id: number): Promise<Department> => {
    const response = await api.get(`/departments/${id}/hierarchy`);
    return response.data;
  },
};
