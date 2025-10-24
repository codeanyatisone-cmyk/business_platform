import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  Star, 
  Clock, 
  User, 
  Tag, 
  MessageSquare, 
  CheckSquare,
  Calendar,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Archive
} from 'lucide-react';
import { Task, Employee } from '../../types';
import { Button } from '../ui/Button';

interface NotionTaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (task: Partial<Task>) => void;
  onTaskDelete: (taskId: number) => void;
  employees: Employee[];
}

export function NotionTaskList({ 
  tasks, 
  onTaskClick, 
  onTaskUpdate, 
  onTaskDelete, 
  employees 
}: NotionTaskListProps) {
  const [hoveredTask, setHoveredTask] = useState<number | null>(null);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return 'text-red-600 bg-red-50';
      case 2: return 'text-yellow-600 bg-yellow-50';
      case 1: return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3: return 'Высокий';
      case 2: return 'Средний';
      case 1: return 'Низкий';
      default: return 'Не указан';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'backlog': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Новая';
      case 'in_progress': return 'В работе';
      case 'review': return 'На проверке';
      case 'completed': return 'Завершена';
      case 'cancelled': return 'Отменена';
      case 'backlog': return 'Бэклог';
      default: return status;
    }
  };

  const getAssigneeName = (assigneeId: number) => {
    const employee = employees.find(emp => emp.id === assigneeId);
    return employee ? employee.name : 'Не назначен';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Завтра';
    if (diffDays === -1) return 'Вчера';
    if (diffDays > 0) return `Через ${diffDays} дн.`;
    if (diffDays < 0) return `${Math.abs(diffDays)} дн. назад`;
    
    return date.toLocaleDateString('ru-RU');
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="flex-1 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Список задач</h2>
            <div className="text-sm text-gray-500">
              {tasks.length} задач
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="divide-y divide-gray-200">
          {tasks.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 mb-4">
                <CheckSquare className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет задач</h3>
              <p className="text-gray-500">Создайте первую задачу или измените фильтры</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors group"
                onMouseEnter={() => setHoveredTask(task.id)}
                onMouseLeave={() => setHoveredTask(null)}
              >
                <div className="flex items-center space-x-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => onTaskUpdate({ 
                      ...task, 
                      status: task.status === 'completed' ? 'new' : 'completed' 
                    })}
                    className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    {task.status === 'completed' ? (
                      <CheckSquare className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-gray-300 rounded hover:border-gray-400 transition-colors" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      {/* Title */}
                      <h3 
                        className={`text-sm font-medium text-gray-900 cursor-pointer hover:text-pink-600 transition-colors ${
                          task.status === 'completed' ? 'line-through text-gray-500' : ''
                        }`}
                        onClick={() => onTaskClick(task)}
                      >
                        {task.title}
                      </h3>

                      {/* Favorite */}
                      {task.isFavorite && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}

                      {/* Priority */}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>

                      {/* Status */}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {task.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                            +{task.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {/* Assignee */}
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{getAssigneeName(task.assigneeId)}</span>
                      </div>

                      {/* Due Date */}
                      {task.dueDate && (
                        <div className={`flex items-center space-x-1 ${
                          isOverdue(task.dueDate) && task.status !== 'completed' 
                            ? 'text-red-600' 
                            : ''
                        }`}>
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                      )}

                      {/* Comments */}
                      {task.comments && task.comments.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{task.comments.length}</span>
                        </div>
                      )}

                      {/* Checklist */}
                      {task.checklist && task.checklist.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <CheckSquare className="h-3 w-3" />
                          <span>
                            {task.checklist.filter(item => item.completed).length}/{task.checklist.length}
                          </span>
                        </div>
                      )}

                      {/* Story Points */}
                      {task.storyPoints && (
                        <div className="flex items-center space-x-1">
                          <span className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                            {task.storyPoints} SP
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={`flex items-center space-x-2 transition-opacity ${
                    hoveredTask === task.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTaskClick(task)}
                      className="p-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTaskUpdate({ ...task, isFavorite: !task.isFavorite })}
                      className="p-1"
                    >
                      <Star className={`h-4 w-4 ${task.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTaskDelete(task.id)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
