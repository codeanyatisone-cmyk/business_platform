import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function AnniversariesPage() {
  const { state } = useApp();
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [responsibleHRFilter, setResponsibleHRFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Фильтрация данных
  const filteredAnniversaries = useMemo(() => {
    return state.employees.filter(employee => {
      // Здесь будет логика фильтрации по годовщинам
      return true; // Пока показываем всех
    });
  }, [state.employees]);

  const getAnniversaryType = (employee: any) => {
    return 'Годовщина';
  };

  const getAnniversaryValue = (employee: any) => {
    const hireDate = new Date(employee.hireDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - hireDate.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths < 12) {
      return `${diffMonths} мес.`;
    } else {
      const years = Math.floor(diffMonths / 12);
      return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`;
    }
  };

  const getEventDate = (employee: any) => {
    const hireDate = new Date(employee.hireDate);
    const nextAnniversary = new Date(hireDate);
    nextAnniversary.setFullYear(2025);
    return nextAnniversary.toLocaleDateString('ru-RU');
  };

  const getHireDate = (employee: any) => {
    return new Date(employee.hireDate).toLocaleDateString('ru-RU');
  };

  const getBirthDate = (employee: any) => {
    return employee.birthDate ? new Date(employee.birthDate).toLocaleDateString('ru-RU') : '';
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Фильтры */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Фильтры</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Тип события */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип события
            </label>
            <div className="relative">
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 appearance-none"
              >
                <option value="">Выберите значение</option>
                <option value="anniversary">Годовщина</option>
                <option value="birthday">День рождения</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Ответственный HR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ответственный HR
            </label>
            <div className="relative">
              <select
                value={responsibleHRFilter}
                onChange={(e) => setResponsibleHRFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 appearance-none"
              >
                <option value="">Выберите сотрудника</option>
                <option value="hr1">HR Менеджер 1</option>
                <option value="hr2">HR Менеджер 2</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Главная должность */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Главная должность
            </label>
            <div className="relative">
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 appearance-none"
              >
                <option value="">Выберите должность</option>
                <option value="owner">Владелец</option>
                <option value="director">Генеральный директор</option>
                <option value="manager">Менеджер</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Дата события */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата события
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Начало"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Конец"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сотрудник
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Главная должность
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тип
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Значение
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата события
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата найма
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  День рождения
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAnniversaries.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={employee.avatar}
                        alt={employee.name}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                          {employee.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getAnniversaryType(employee)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getAnniversaryValue(employee)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getEventDate(employee)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getHireDate(employee)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getBirthDate(employee)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
