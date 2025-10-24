import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  MessageSquare, 
  Clock, 
  Star,
  User,
  Tag,
  CheckSquare,
  Calendar,
  ArrowUp,
  ArrowDown,
  Edit,
  Archive,
  Trash2
} from 'lucide-react';
import { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onUpdate?: (task: Partial<Task>) => void;
  onDelete?: (taskId: number) => void;
  showActions?: boolean;
}

export function TaskCard({ task, onClick, onUpdate, onDelete, showActions = false }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Priority styling
  const getPriorityClass = () => {
    switch (task.priority) {
      case 3:
        return 'border-l-red-500 bg-red-50';
      case 2:
        return 'border-l-yellow-500 bg-yellow-50';
      case 1:
      default:
        return 'border-l-green-500 bg-green-50';
    }
  };

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 3:
        return <ArrowUp className="h-3 w-3 text-red-600" />;
      case 2:
        return <div className="w-3 h-3 bg-yellow-500 rounded-full" />;
      case 1:
      default:
        return <ArrowDown className="h-3 w-3 text-green-600" />;
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
    
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && task.status !== 'completed';
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${getPriorityClass()} ${
        task.status === 'completed' ? 'opacity-75' : ''
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-2">
            <h4 
              className={`text-sm font-medium text-gray-900 mb-1 ${
                task.status === 'completed' ? 'line-through text-gray-500' : ''
              }`}
              onClick={onClick}
            >
              {task.title}
            </h4>
            
            {/* Status and Priority */}
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                {getStatusLabel(task.status)}
              </span>
              <div className="flex items-center space-x-1">
                {getPriorityIcon()}
              </div>
            </div>
          </div>

          {/* Actions */}
          {(isHovered || showActions) && (
            <div className="flex items-center space-x-1">
              {task.isFavorite && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate?.({ ...task, isFavorite: !task.isFavorite });
                }}
                className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
              >
                <Star className={`h-4 w-4 ${task.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
              </button>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Assignee */}
          {task.assignee && (
            <div className="flex items-center space-x-2">
              <img
                src={task.assignee.avatar}
                alt={task.assignee.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-xs text-gray-600">{task.assignee.name}</span>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center space-x-3 text-gray-400">
            {/* Comments */}
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-3 w-3" />
                <span className="text-xs">{task.comments.length}</span>
              </div>
            )}

            {/* Checklist */}
            {task.checklist && task.checklist.length > 0 && (
              <div className="flex items-center space-x-1">
                <CheckSquare className="h-3 w-3" />
                <span className="text-xs">
                  {task.checklist.filter(item => item.completed).length}/{task.checklist.length}
                </span>
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div className={`flex items-center space-x-1 ${
                isOverdue(task.dueDate) ? 'text-red-600' : ''
              }`}>
                <Calendar className="h-3 w-3" />
                <span className="text-xs">
                  {formatDate(task.dueDate)}
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
      </div>
    </div>
  );
}


