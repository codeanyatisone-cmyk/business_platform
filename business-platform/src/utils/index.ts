import { Employee } from '../types';

/**
 * Получить имя исполнителя задачи
 */
export function getAssigneeName(assignee: Employee | string | number | null | undefined): string {
  if (!assignee) return 'Не назначен';
  
  if (typeof assignee === 'string') return assignee;
  if (typeof assignee === 'number') return `Сотрудник #${assignee}`;
  if (typeof assignee === 'object' && assignee.name) return assignee.name;
  
  return 'Не назначен';
}

/**
 * Получить аватар исполнителя задачи
 */
export function getAssigneeAvatar(assignee: Employee | string | number | null | undefined): string {
  if (!assignee) return '';
  
  if (typeof assignee === 'object' && assignee.avatar) return assignee.avatar;
  
  return '';
}

/**
 * Форматировать дату для отображения
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Форматировать дату и время для отображения
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Получить цвет приоритета
 */
export function getPriorityColor(priority: number): string {
  if (priority >= 5) return 'text-red-600 bg-red-100';
  if (priority >= 4) return 'text-orange-600 bg-orange-100';
  if (priority >= 3) return 'text-yellow-600 bg-yellow-100';
  if (priority >= 2) return 'text-blue-600 bg-blue-100';
  return 'text-gray-600 bg-gray-100';
}

/**
 * Получить текст приоритета
 */
export function getPriorityText(priority: number): string {
  if (priority >= 5) return 'Критический';
  if (priority >= 4) return 'Высокий';
  if (priority >= 3) return 'Средний';
  if (priority >= 2) return 'Низкий';
  return 'Минимальный';
}

/**
 * Получить цвет статуса
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-700';
    case 'inProgress': return 'bg-blue-100 text-blue-700';
    case 'review': return 'bg-yellow-100 text-yellow-700';
    case 'new': return 'bg-gray-100 text-gray-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

/**
 * Получить текст статуса
 */
export function getStatusText(status: string): string {
  switch (status) {
    case 'completed': return 'Завершена';
    case 'inProgress': return 'В работе';
    case 'review': return 'На проверке';
    case 'new': return 'Новая';
    default: return status;
  }
}

/**
 * Проверить, просрочена ли задача
 */
export function isTaskOverdue(task: { dueDate?: string | Date | null; status: string }): boolean {
  if (!task.dueDate || task.status === 'completed') return false;
  
  const dueDate = typeof task.dueDate === 'string' ? new Date(task.dueDate) : task.dueDate;
  const now = new Date();
  
  return dueDate < now;
}

/**
 * Получить прогресс задачи в процентах
 */
export function getTaskProgress(task: { checklist?: Array<{ completed: boolean }> }): number {
  if (!task.checklist || task.checklist.length === 0) return 0;
  
  const completed = task.checklist.filter(item => item.completed).length;
  return Math.round((completed / task.checklist.length) * 100);
}

/**
 * Генерация уникального ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Дебаунс функция
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Тротлинг функция
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Утилита для объединения CSS классов
 */
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Генерация аватара на основе имени
 */
export function generateAvatar(name: string): string {
  // Генерируем цвет на основе имени
  const colors = [
    'f44336', // red
    'e91e63', // pink
    '9c27b0', // purple
    '673ab7', // deep purple
    '3f51b5', // indigo
    '2196f3', // blue
    '03a9f4', // light blue
    '00bcd4', // cyan
    '009688', // teal
    '4caf50', // green
    '8bc34a', // light green
    'cddc39', // lime
    'ffeb3b', // yellow
    'ffc107', // amber
    'ff9800', // orange
    'ff5722', // deep orange
    '795548', // brown
    '607d8b', // blue grey
  ];
  
  const hash = name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const colorIndex = Math.abs(hash) % colors.length;
  const color = colors[colorIndex];
  
  // Получаем инициалы
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  return `https://via.placeholder.com/40x40/${color}/fff?text=${encodeURIComponent(initials)}`;
}

/**
 * Форматирование короткой даты
 */
export function formatShortDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit'
  });
}