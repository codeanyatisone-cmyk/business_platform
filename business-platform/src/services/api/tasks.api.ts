import { api } from './axios.config';
import { Task, Sprint, Epic } from '../../types';

export const tasksApi = {
  // Получить все задачи
  async getTasks(companyId?: number, departmentId?: number): Promise<Task[]> {
    const params: any = {};
    if (companyId) params.companyId = companyId;
    if (departmentId) params.departmentId = departmentId;
    
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  // Получить задачу по ID
  async getTask(id: number): Promise<Task> {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Создать задачу
  async createTask(data: Partial<Task>): Promise<Task> {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  // Обновить задачу
  async updateTask(id: number, data: Partial<Task>): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  // Удалить задачу
  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  // Добавить/убрать из избранного
  async toggleFavorite(id: number): Promise<Task> {
    const response = await api.put(`/tasks/${id}/favorite`);
    return response.data;
  },

  // Получить задачи по исполнителю
  async getTasksByAssignee(assigneeId: number): Promise<Task[]> {
    const response = await api.get(`/tasks/assignee/${assigneeId}`);
    return response.data;
  },

  // Получить задачи по создателю
  async getTasksByCreator(creatorId: number): Promise<Task[]> {
    const response = await api.get(`/tasks/creator/${creatorId}`);
    return response.data;
  },

  // Получить статистику
  async getStatistics(): Promise<any> {
    const response = await api.get('/tasks/statistics');
    return response.data;
  },

  // ============ SPRINTS ============
  async getSprints(): Promise<Sprint[]> {
    const response = await api.get('/tasks/sprints/all');
    return response.data;
  },

  async getSprint(id: number): Promise<Sprint> {
    const response = await api.get(`/tasks/sprints/${id}`);
    return response.data;
  },

  async createSprint(data: Partial<Sprint>): Promise<Sprint> {
    const response = await api.post('/tasks/sprints', data);
    return response.data;
  },

  async updateSprint(id: number, data: Partial<Sprint>): Promise<Sprint> {
    const response = await api.put(`/tasks/sprints/${id}`, data);
    return response.data;
  },

  async startSprint(id: number): Promise<Sprint> {
    const response = await api.put(`/tasks/sprints/${id}/start`);
    return response.data;
  },

  async completeSprint(id: number): Promise<Sprint> {
    const response = await api.put(`/tasks/sprints/${id}/complete`);
    return response.data;
  },

  // ============ EPICS ============
  async getEpics(): Promise<Epic[]> {
    const response = await api.get('/tasks/epics/all');
    return response.data;
  },

  async createEpic(data: Partial<Epic>): Promise<Epic> {
    const response = await api.post('/tasks/epics', data);
    return response.data;
  },

  async updateEpic(id: number, data: Partial<Epic>): Promise<Epic> {
    const response = await api.put(`/tasks/epics/${id}`, data);
    return response.data;
  },
};


