import React from 'react';
import { MoreHorizontal, MessageSquare, Clock } from 'lucide-react';
import { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  // Определяем класс для приоритета
  const getPriorityClass = () => {
    switch (task.priority) {
      case 3:
        return 'border-l-4 border-red-500';
      case 2:
        return 'border-l-4 border-yellow-500';
      case 1:
      default:
        return 'border-l-4 border-green-500';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${getPriorityClass()}`}
    >
      <div className="p-4">
        {/* Заголовок задачи */}
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900 flex-1 pr-2">
            {task.title}
          </h4>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Описание (если есть) */}
        {task.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Теги */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Нижняя часть: аватар, комментарии, чеклист */}
        <div className="flex items-center justify-between">
          {/* Исполнитель */}
          {task.assignee && (
            <div className="flex items-center">
              <img
                src={task.assignee.avatar}
                alt={task.assignee.name}
                className="w-6 h-6 rounded-full"
              />
            </div>
          )}

          {/* Метаинформация */}
          <div className="flex items-center space-x-3 text-gray-400">
            {/* Комментарии */}
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-3 w-3" />
                <span className="text-xs">{task.comments.length}</span>
              </div>
            )}

            {/* Чеклист */}
            {task.checklist && task.checklist.length > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-xs">
                  {task.checklist.filter(item => item.completed).length}/
                  {task.checklist.length}
                </span>
              </div>
            )}

            {/* Дедлайн */}
            {task.dueDate && (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">
                  {new Date(task.dueDate).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


