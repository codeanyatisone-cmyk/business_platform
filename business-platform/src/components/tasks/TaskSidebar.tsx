import React from 'react';
import { User, Calendar, Tag, Star } from 'lucide-react';
import { Employee, Sprint, Epic } from '../../types';

interface TaskSidebarProps {
  employees: Employee[];
  sprints?: Sprint[];
  epics?: Epic[];
  selectedEmployee?: number;
  selectedSprint?: number;
  selectedEpic?: number;
  onEmployeeSelect: (employeeId?: number) => void;
  onSprintSelect: (sprintId?: number) => void;
  onEpicSelect: (epicId?: number) => void;
}

export function TaskSidebar({
  employees,
  sprints = [],
  epics = [],
  selectedEmployee,
  selectedSprint,
  selectedEpic,
  onEmployeeSelect,
  onSprintSelect,
  onEpicSelect,
}: TaskSidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Фильтры</h2>

        {/* Поиск по тексту */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Поиск по тексту
          </label>
          <input
            type="text"
            placeholder="Поиск задачи..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Избранные задачи */}
        <div className="mb-6">
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            <Star className="h-4 w-4" />
            <span>Избранные задачи</span>
          </button>
        </div>

        {/* Дата создания */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Дата создания
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Срок выполнения */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Срок выполнения
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
            <option value="">Все</option>
            <option value="overdue">Просроченные</option>
            <option value="today">Сегодня</option>
            <option value="week">На этой неделе</option>
            <option value="month">В этом месяце</option>
          </select>
        </div>

        {/* Исполнитель */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline h-4 w-4 mr-1" />
            Исполнитель
          </label>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            <label className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={!selectedEmployee}
                onChange={() => onEmployeeSelect(undefined)}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Все исполнители</span>
            </label>
            {employees.map((employee) => (
              <label
                key={employee.id}
                className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedEmployee === employee.id}
                  onChange={() => onEmployeeSelect(employee.id)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <img
                  src={employee.avatar}
                  alt={employee.name}
                  className="w-5 h-5 rounded-full"
                />
                <span className="text-sm text-gray-700">{employee.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Команда/Отдел */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Команда/Отдел
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
            <option value="">Все отделы</option>
            {Array.from(new Set(employees.map(e => e.department))).map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Приоритет */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Приоритет
          </label>
          <div className="space-y-1">
            <label className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="w-3 h-3 bg-red-500 rounded"></span>
              <span className="text-sm text-gray-700">Высокий</span>
            </label>
            <label className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="w-3 h-3 bg-yellow-500 rounded"></span>
              <span className="text-sm text-gray-700">Средний</span>
            </label>
            <label className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="w-3 h-3 bg-green-500 rounded"></span>
              <span className="text-sm text-gray-700">Низкий</span>
            </label>
          </div>
        </div>

        {/* Категория */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Категория
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
            <option value="">Все категории</option>
            <option value="development">Разработка</option>
            <option value="design">Дизайн</option>
            <option value="marketing">Маркетинг</option>
            <option value="sales">Продажи</option>
          </select>
        </div>

        {/* Теги */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Tag className="inline h-4 w-4 mr-1" />
            Теги
          </label>
          <div className="flex flex-wrap gap-1">
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded cursor-pointer hover:bg-gray-200">
              Backend
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded cursor-pointer hover:bg-gray-200">
              Frontend
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded cursor-pointer hover:bg-gray-200">
              Design
            </span>
          </div>
        </div>

        {/* Родительская задача */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Родительская задача
          </label>
          <input
            type="text"
            placeholder="Выберите..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Статус */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Статус
          </label>
          <div className="space-y-1">
            {['Новые', 'В работе', 'На проверке', 'Завершено'].map((status) => (
              <label
                key={status}
                className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">{status}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="pt-4 border-t border-gray-200">
          <button className="w-full px-4 py-2 text-sm text-pink-600 hover:bg-pink-50 rounded-lg transition-colors mb-2">
            Сохранить фильтр
          </button>
          <button className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            Сбросить фильтры
          </button>
        </div>
      </div>
    </div>
  );
}


