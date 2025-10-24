import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  User,
  Tag,
  CheckSquare,
  MessageSquare,
  Star,
  Plus
} from 'lucide-react';
import { Task, Employee } from '../../types';
import { Button } from '../ui/Button';

interface NotionTaskCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (task: Partial<Task>) => void;
  onTaskDelete: (taskId: number) => void;
  employees: Employee[];
}

export function NotionTaskCalendar({ 
  tasks, 
  onTaskClick, 
  onTaskUpdate, 
  onTaskDelete, 
  employees 
}: NotionTaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const getAssigneeName = (assigneeId: number) => {
    const employee = employees.find(emp => emp.id === assigneeId);
    return employee ? employee.name : 'Не назначен';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'review': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'backlog': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return 'border-l-red-500';
      case 2: return 'border-l-yellow-500';
      case 1: return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  // Calendar generation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: { [key: string]: Task[] } = {};
    
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = new Date(task.dueDate).toDateString();
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    
    return grouped;
  }, [tasks]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="flex-1 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Календарь задач
              </h2>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    viewMode === 'month'
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Месяц
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    viewMode === 'week'
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Неделя
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    viewMode === 'day'
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  День
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h3 className="text-lg font-medium text-gray-900 min-w-[200px] text-center">
                  {formatMonthYear(currentDate)}
                </h3>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              
              <Button
                onClick={() => setCurrentDate(new Date())}
                variant="ghost"
                size="sm"
              >
                Сегодня
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const dateKey = date.toDateString();
              const dayTasks = tasksByDate[dateKey] || [];
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDay = isToday(date);

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-gray-200 ${
                    isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'
                  } ${isTodayDay ? 'bg-pink-50 border-pink-200' : ''}`}
                >
                  {/* Date Number */}
                  <div className={`text-sm font-medium mb-2 ${
                    isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
                  } ${isTodayDay ? 'text-pink-600' : ''}`}>
                    {date.getDate()}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={`p-1 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow border-l-4 ${getPriorityColor(task.priority)}`}
                      >
                        <div className={`w-full h-1 rounded-full mb-1 ${getStatusColor(task.status)}`} />
                        <div className="text-gray-900 font-medium truncate">
                          {task.title}
                        </div>
                        <div className="text-gray-500 truncate">
                          {getAssigneeName(task.assigneeId)}
                        </div>
                      </div>
                    ))}
                    
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{dayTasks.length - 3} еще
                      </div>
                    )}
                  </div>

                  {/* Add Task Button */}
                  <button
                    onClick={() => {
                      // Create new task with this date as due date
                      const newTask = {
                        id: Date.now(), // Add missing id
                        title: 'Новая задача',
                        dueDate: date.toISOString().split('T')[0],
                        status: 'new' as const,
                        priority: 1 as const,
                        assigneeId: 1, // TODO: Get current user
                        tags: [],
                        isFavorite: false,
                        companyId: 1, // TODO: Get current company
                        creatorId: 1, // TODO: Get current user
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      };
                      onTaskClick(newTask as Task);
                    }}
                    className="w-full mt-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Plus className="h-3 w-3 mx-auto" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-6">
            <div className="text-sm font-medium text-gray-700">Статусы:</div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-xs text-gray-600">Новые</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-xs text-gray-600">В работе</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-xs text-gray-600">На проверке</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-600">Завершены</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
