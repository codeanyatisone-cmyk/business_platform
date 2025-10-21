import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Employee } from '../types';

export function AbsencesPage() {
  const { state } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Фильтры
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [absenceTypeFilter, setAbsenceTypeFilter] = useState('');

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

  // Получение дней месяца
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Понедельник = 0

    const days = [];
    
    // Добавляем пустые дни в начале
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Получение отсутствий для сотрудника в определенный день
  const getAbsenceForEmployeeAndDate = (employee: Employee, date: Date) => {
    return state.absences.find(absence => {
      const startDate = new Date(absence.startDate);
      const endDate = new Date(absence.endDate);
      const employeeMatch = state.employees.find(emp => emp.id === absence.employeeId);
      
      return employeeMatch?.id === employee.id && 
             date >= startDate && 
             date <= endDate;
    });
  };

  // Получение типа отсутствия
  const getAbsenceTypeLabel = (type: string) => {
    switch (type) {
      case 'vacation': return 'ОТ'; // Отпуск
      case 'sick': return 'Б'; // Больничный
      case 'businessTrip': return 'К'; // Командировка
      case 'dayOff': return 'О'; // Отгул
      default: return '';
    }
  };

  // Получение цвета для типа отсутствия
  const getAbsenceTypeColor = (type: string) => {
    switch (type) {
      case 'vacation': return 'bg-green-500 text-white'; // Отпуск - зеленый
      case 'sick': return 'bg-red-500 text-white'; // Больничный - красный
      case 'businessTrip': return 'bg-blue-500 text-white'; // Командировка - синий
      case 'dayOff': return 'bg-yellow-500 text-white'; // Отгул - желтый
      default: return 'bg-gray-500 text-white';
    }
  };

  // Фильтрация сотрудников
  const filteredEmployees = useMemo(() => {
    return state.employees.filter(employee => {
      const matchesEmployee = !employeeFilter || employee.name.toLowerCase().includes(employeeFilter.toLowerCase());
      const matchesPosition = !positionFilter || employee.position.toLowerCase().includes(positionFilter.toLowerCase());
      
      // Фильтр по типу отсутствия - проверяем есть ли у сотрудника отсутствия этого типа
      const matchesAbsenceType = !absenceTypeFilter || state.absences.some(absence => {
        const employeeMatch = state.employees.find(emp => emp.id === absence.employeeId);
        return employeeMatch?.id === employee.id && absence.type === absenceTypeFilter;
      });
      
      return matchesEmployee && matchesPosition && matchesAbsenceType;
    });
  }, [state.employees, state.absences, employeeFilter, positionFilter, absenceTypeFilter]);

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Фильтры */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Фильтры
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Сотрудник
            </label>
            <input
              type="text"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              placeholder="Поиск по имени"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Должность сотрудника
            </label>
            <input
              type="text"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              placeholder="Поиск по должности"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип отсутствия
            </label>
            <select
              value={absenceTypeFilter}
              onChange={(e) => setAbsenceTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="">Все типы</option>
              <option value="vacation">Отпуск</option>
              <option value="sick">Больничный</option>
              <option value="businessTrip">Командировка</option>
              <option value="dayOff">Отгул</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium">
            Фильтровать
          </button>
        </div>
      </div>

      {/* Календарь */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Заголовок календаря */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Легенда */}
        <div className="flex items-center space-x-4 mb-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-gray-600">ОТ - Отпуск</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-gray-600">Б - Больничный</span>
          </div>
        </div>

        {/* Таблица календаря */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-200 p-2 bg-gray-50 text-left text-sm font-medium text-gray-700 w-48">
                  Сотрудник
                </th>
                {weekDays.map(day => (
                  <th key={day} className="border border-gray-200 p-1 bg-gray-50 text-center text-xs font-medium text-gray-700 min-w-[40px]">
                    {day}
                  </th>
                ))}
              </tr>
              <tr>
                <th className="border border-gray-200 p-2 bg-gray-50"></th>
                {days.map((date, index) => (
                  <th key={index} className="border border-gray-200 p-1 bg-gray-50 text-center text-xs text-gray-600 min-w-[40px]">
                    {date ? date.getDate() : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employee.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {employee.position}
                        </div>
                      </div>
                    </div>
                  </td>
                  {days.map((date, index) => {
                    const absence = date ? getAbsenceForEmployeeAndDate(employee, date) : null;
                    return (
                      <td key={index} className="border border-gray-200 p-1 text-center min-w-[40px] h-12">
                        {absence && (
                          <div className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center mx-auto ${getAbsenceTypeColor(absence.type)}`}>
                            {getAbsenceTypeLabel(absence.type)}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Нет сотрудников, соответствующих фильтрам</p>
          </div>
        )}
      </div>
    </div>
  );
}

