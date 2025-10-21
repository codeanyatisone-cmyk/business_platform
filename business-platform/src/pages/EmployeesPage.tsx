import React, { useState, useMemo } from 'react';
import { Search, X, Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useApp } from '../contexts/AppContext';
import { useNotification } from '../hooks/useNotification';
import { formatShortDate } from '../utils';
import { Employee } from '../types';

type SidebarTab = 'info' | 'positions' | 'events' | 'courses' | 'salary';

export function EmployeesPage() {
  const { state, dispatch } = useApp();
  const { showNotification } = useNotification();
  
  // ============================================================================
  // STATE
  // ============================================================================
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showTerminated, setShowTerminated] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>('info');

  // ============================================================================
  // OPTIONS
  // ============================================================================
  const positionOptions = useMemo(() => [
    { value: '', label: 'Выберите должность' },
    { value: 'Владелец', label: 'Владелец' },
    { value: 'Генеральный директор', label: 'Генеральный директор' },
    { value: 'Бухгалтер', label: 'Бухгалтер' },
    { value: 'ИТ инженер', label: 'ИТ инженер' },
    { value: 'Ассистент', label: 'Ассистент' },
  ], []);

  const hrOptions = useMemo(() => [
    { value: '', label: 'Выберите сотрудника' },
    ...state.employees.map(emp => ({
      value: emp.name,
      label: emp.name
    }))
  ], [state.employees]);

  const workScheduleOptions = useMemo(() => [
    { value: '', label: 'Выберите значение' },
    { value: 'full', label: 'Полный день' },
    { value: 'part', label: 'Неполный день' },
    { value: 'remote', label: 'Удаленно' },
  ], []);

  const departmentOptions = useMemo(() => [
    { value: '', label: 'Все отделы' },
    ...Array.from(new Set(state.employees.map(emp => emp.department))).map(dept => ({
      value: dept,
      label: dept
    }))
  ], [state.employees]);

  // ============================================================================
  // FILTERED DATA
  // ============================================================================
  const filteredEmployees = useMemo(() => {
    return state.employees.filter(employee => {
      const matchesSearch = 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPosition = !positionFilter || employee.position.includes(positionFilter);
      const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
      const matchesTerminated = showTerminated || employee.status !== 'terminated';

      return matchesSearch && matchesPosition && matchesDepartment && matchesTerminated;
    });
  }, [state.employees, searchTerm, positionFilter, departmentFilter, showTerminated]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleToggleStatus = (employeeId: number) => {
    const employee = state.employees.find(emp => emp.id === employeeId);
    if (employee) {
      const newStatus = employee.status === 'active' ? 'inactive' : 'active';
      const updatedEmployee = { ...employee, status: newStatus as 'active' | 'inactive' };
      dispatch({ type: 'UPDATE_EMPLOYEE', payload: updatedEmployee });
      showNotification({
        message: `Статус сотрудника ${employee.name} изменен`,
        type: 'success',
      });
    }
  };

  const handleDeleteEmployee = (employeeId: number) => {
    const employee = state.employees.find(emp => emp.id === employeeId);
    if (employee && window.confirm(`Вы уверены, что хотите удалить сотрудника ${employee.name}?`)) {
      dispatch({ type: 'DELETE_EMPLOYEE', payload: employeeId });
      showNotification({
        message: `Сотрудник ${employee.name} удален`,
        type: 'success',
      });
      if (selectedEmployee?.id === employeeId) {
        setSelectedEmployee(null);
      }
    }
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setActiveTab('info');
  };

  const handleTabChange = (direction: 'prev' | 'next') => {
    const tabs: SidebarTab[] = ['info', 'positions', 'events', 'courses', 'salary'];
    const currentIndex = tabs.indexOf(activeTab);
    
    if (direction === 'prev' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="flex h-full bg-gray-50">
      {/* ========================================================================
          MAIN CONTENT AREA
      ======================================================================== */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${selectedEmployee ? 'mr-96' : ''}`}>
        
        {/* ====================================================================
            HEADER
        ==================================================================== */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Сотрудники</h1>
            <Button icon={<Plus className="h-4 w-4" />}>
              Добавить сотрудника
            </Button>
          </div>
        </div>

        {/* ====================================================================
            FILTERS SECTION
        ==================================================================== */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Фильтры</h3>
          
          {/* Row 1: Search, Position, Work Schedule, Birth Date */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Поиск
              </label>
              <Input
                placeholder="Введите имя, email или телефон"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Должность
              </label>
              <Select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                options={positionOptions}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Отдел
              </label>
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                options={departmentOptions}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Рабочий график
              </label>
              <Select
                value=""
                onChange={() => {}}
                options={workScheduleOptions}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Дата рождения
              </label>
              <div className="flex items-center space-x-2">
                <Input placeholder="Начало" />
                <span className="text-gray-400">-</span>
                <Input placeholder="Конец" />
              </div>
            </div>
          </div>

          {/* Row 2: Recruiter, HR, Termination Date, Hire Date */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Рекрутер
              </label>
              <Select
                value=""
                onChange={() => {}}
                options={hrOptions}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Ответственный HR
              </label>
              <Select
                value=""
                onChange={() => {}}
                options={hrOptions}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Дата увольнения
              </label>
              <div className="flex items-center space-x-2">
                <Input placeholder="Начало" />
                <span className="text-gray-400">-</span>
                <Input placeholder="Конец" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Дата найма
              </label>
              <div className="flex items-center space-x-2">
                <Input placeholder="Начало" />
                <span className="text-gray-400">-</span>
                <Input placeholder="Конец" />
              </div>
            </div>
          </div>

          {/* Row 3: Checkboxes and Toggles */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => {}}
                  className="mr-2 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                Учитывать только главные должности
              </label>
              
              <label className="flex items-center text-sm text-gray-700">
                <span className="mr-2">Показать уволенных</span>
                <button
                  onClick={() => setShowTerminated(!showTerminated)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showTerminated ? 'bg-pink-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showTerminated ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>
        </div>

        {/* ====================================================================
            TABLE
        ==================================================================== */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Имя
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Главная должность <span className="text-blue-500" title="Информация">ⓘ</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Телефон
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата рождения
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата найма
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата увольнения
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ответственный HR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Был в сети
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус <span className="text-blue-500" title="Информация">ⓘ</span>
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr 
                  key={employee.id} 
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedEmployee?.id === employee.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleEmployeeClick(employee)}
                >
                  {/* Name with Avatar */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={employee.avatar}
                        alt={employee.name}
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {employee.name}
                      </span>
                    </div>
                  </td>
                  
                  {/* Position */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.position}</div>
                    {employee.department && (
                      <div className="text-xs text-gray-500">({employee.department})</div>
                    )}
                  </td>
                  
                  {/* Email */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.email}
                  </td>
                  
                  {/* Phone */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.phone || '-'}
                  </td>
                  
                  {/* Birth Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.birthDate ? formatShortDate(employee.birthDate) : '-'}
                  </td>
                  
                  {/* Hire Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatShortDate(employee.hireDate)}
                  </td>
                  
                  {/* Termination Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.terminationDate ? formatShortDate(employee.terminationDate) : '-'}
                  </td>
                  
                  {/* HR Responsible */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.hr || '-'}
                  </td>
                  
                  {/* Last Online */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.status === 'active' ? 'Только что' : 'Давно'}
                  </td>
                  
                  {/* Status Toggle */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(employee.id);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        employee.status === 'active' ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          employee.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  
                  {/* Delete Button */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEmployee(employee.id);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Удалить сотрудника"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Сотрудники не найдены</p>
            </div>
          )}
        </div>

        {/* ====================================================================
            FOOTER
        ==================================================================== */}
        <div className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>
              Всего: {filteredEmployees.length} / Всего тарифицируемых: {filteredEmployees.length}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================
          RIGHT SIDEBAR - EMPLOYEE DETAILS
      ======================================================================== */}
      {selectedEmployee && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-gray-200 shadow-lg z-30 flex flex-col">
          
          {/* ====================================================================
              SIDEBAR HEADER
          ==================================================================== */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Сотрудник: {selectedEmployee.name}
            </h2>
            <button
              onClick={() => setSelectedEmployee(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ====================================================================
              TABS NAVIGATION
          ==================================================================== */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex items-center space-x-1 overflow-x-auto">
              {/* Previous Tab Button */}
              <button
                onClick={() => handleTabChange('prev')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={activeTab === 'info'}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {/* Tab Buttons */}
              {[
                { id: 'info' as SidebarTab, label: 'Информация' },
                { id: 'positions' as SidebarTab, label: 'Должности' },
                { id: 'events' as SidebarTab, label: 'События' },
                { id: 'courses' as SidebarTab, label: 'Пройденные курсы' },
                { id: 'salary' as SidebarTab, label: 'Зарплата' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-3 whitespace-nowrap font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              
              {/* Next Tab Button */}
              <button
                onClick={() => handleTabChange('next')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={activeTab === 'salary'}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ====================================================================
              TAB CONTENT
          ==================================================================== */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            
            {/* INFO TAB */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Аватар
                  </label>
                  <div className="flex items-center space-x-4">
                    <img
                      className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                      src={selectedEmployee.avatar}
                      alt={selectedEmployee.name}
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Имя
                  </label>
                  <Input value={selectedEmployee.name} readOnly />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input value={selectedEmployee.email || ''} readOnly />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </label>
                  <Input 
                    value={selectedEmployee.phone || ''} 
                    placeholder="Введите Телефон"
                    readOnly 
                  />
                </div>

                {/* Slack */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slack
                  </label>
                  <Input placeholder="Введите Slack" readOnly />
                </div>

                {/* Telegram */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telegram
                  </label>
                  <Input placeholder="Введите Telegram" readOnly />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Примечание
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                    placeholder="Введите Примечание"
                    rows={3}
                    readOnly
                  />
                </div>

                {/* Hire Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата найма
                  </label>
                  <div className="relative">
                    <Input
                      value={formatShortDate(selectedEmployee.hireDate)}
                      readOnly
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Termination Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата увольнения <span className="text-gray-400">🔒</span>
                  </label>
                  <div className="relative">
                    <Input
                      value={selectedEmployee.terminationDate ? formatShortDate(selectedEmployee.terminationDate) : ''}
                      placeholder="Выберите Дата увольнения"
                      readOnly
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* HR Responsible */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ответственный HR <span className="text-blue-500" title="Информация">ⓘ</span>
                  </label>
                  <Select
                    value={selectedEmployee.hr || ''}
                    onChange={() => {}}
                    options={hrOptions}
                    disabled
                  />
                </div>

                {/* Recruiter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Рекрутер <span className="text-blue-500" title="Информация">ⓘ</span> <span className="text-gray-400">🔒</span>
                  </label>
                  <Select
                    value={selectedEmployee.recruiter || ''}
                    onChange={() => {}}
                    options={hrOptions}
                    disabled
                  />
                </div>
              </div>
            )}

            {/* POSITIONS TAB */}
            {activeTab === 'positions' && (
              <div className="text-center py-12 text-gray-500">
                <p>Информация о должностях будет доступна в следующей версии</p>
              </div>
            )}

            {/* EVENTS TAB */}
            {activeTab === 'events' && (
              <div className="text-center py-12 text-gray-500">
                <p>Информация о событиях будет доступна в следующей версии</p>
              </div>
            )}

            {/* COURSES TAB */}
            {activeTab === 'courses' && (
              <div className="text-center py-12 text-gray-500">
                <p>Информация о курсах будет доступна в следующей версии</p>
              </div>
            )}

            {/* SALARY TAB */}
            {activeTab === 'salary' && (
              <div className="text-center py-12 text-gray-500">
                <p>Информация о зарплате будет доступна в следующей версии</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
