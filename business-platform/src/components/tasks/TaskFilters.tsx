import React from 'react';
import { Search, Filter, User } from 'lucide-react';
import { Employee } from '../../types';

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedAssignee?: number;
  onAssigneeChange: (employeeId?: number) => void;
  employees: Employee[];
  activeFiltersCount: number;
}

export function TaskFilters({
  searchQuery,
  onSearchChange,
  selectedAssignee,
  onAssigneeChange,
  employees,
  activeFiltersCount
}: TaskFiltersProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center space-x-4">
        {/* Поиск */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Найти задачу"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* Фильтр по исполнителю */}
        <div className="relative">
          <select
            value={selectedAssignee || ''}
            onChange={(e) => onAssigneeChange(e.target.value ? Number(e.target.value) : undefined)}
            className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
          >
            <option value="">Все исполнители</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {/* Кнопка фильтров */}
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-700">Фильтры</span>
          {activeFiltersCount > 0 && (
            <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}


