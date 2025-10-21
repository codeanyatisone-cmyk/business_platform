import React, { useState } from 'react';
import { Download, ZoomIn, ZoomOut, Edit3, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../contexts/AppContext';
import { Employee } from '../types';
import { formatShortDate } from '../utils';

type ModalTab = 'info' | 'positions' | 'events' | 'courses' | 'salary';

export function StructurePage() {
  const { state } = useApp();
  const [zoomLevel, setZoomLevel] = useState(80);
  const [editMode, setEditMode] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>('info');

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handleExport = () => {
    console.log('Экспорт структуры');
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setActiveTab('info');
  };

  const tabs = [
    { id: 'info' as ModalTab, label: 'Информация' },
    { id: 'positions' as ModalTab, label: 'Должности' },
    { id: 'events' as ModalTab, label: 'События' },
    { id: 'courses' as ModalTab, label: 'Пройденные курсы' },
    { id: 'salary' as ModalTab, label: 'Зарплата' },
  ];

  const EmployeeAvatar = ({ employee, onClick }: { employee: Employee; onClick?: () => void }) => (
    <div 
      className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity mb-2"
      onClick={onClick}
    >
      <img
        className="h-8 w-8 rounded-full border-2 border-gray-200 shadow-sm"
        src={employee.avatar}
        alt={employee.name}
      />
      <span className="text-sm text-gray-900 font-medium">{employee.name}</span>
    </div>
  );

  const DepartmentCard = ({ 
    title, 
    subtitle, 
    employees, 
    color,
    result
  }: { 
    title: string; 
    subtitle: string; 
    employees: Employee[]; 
    color: string;
    result?: string;
  }) => (
    <div className={`${color} rounded-lg p-6 flex flex-col h-full min-h-[300px]`}>
      <div className="mb-4">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">{title}</h3>
        <p className="text-xs text-gray-700 uppercase">{subtitle}</p>
      </div>
      <div className="flex-1 space-y-2">
        {employees.map((employee) => (
          <EmployeeAvatar 
            key={employee.id} 
            employee={employee} 
            onClick={() => handleEmployeeClick(employee)}
          />
        ))}
      </div>
      {result && (
        <div className="mt-4 pt-4 border-t border-white border-opacity-30">
          <p className="text-xs font-semibold text-gray-800 mb-1">РЕЗУЛЬТАТ:</p>
          <p className="text-xs text-gray-700">{result}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Структура компании</h1>
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              icon={<Download className="h-4 w-4" />}
            >
              Экспорт в PDF
            </Button>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                icon={<ZoomOut className="h-4 w-4" />}
              />
              <span className="text-sm text-gray-700 font-medium min-w-[50px] text-center">
                {zoomLevel}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                icon={<ZoomIn className="h-4 w-4" />}
              />
            </div>
            <Button
              variant={editMode ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setEditMode(!editMode)}
              icon={<Edit3 className="h-4 w-4" />}
            >
              Режим: <span className="ml-1 text-blue-600">{editMode ? 'Редактирование' : 'Просмотр'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Organization Chart */}
      <div className="flex-1 overflow-auto p-8 bg-white">
        <div
          className="min-w-max mx-auto"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          {/* Title */}
          <h2 className="text-3xl font-bold text-center mb-12">Структура компании</h2>

          {/* Owners */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-6 inline-block">
              <h3 className="text-xs font-bold text-gray-700 uppercase text-center mb-2">ВЛАДЕЛЬЦЫ</h3>
              <p className="text-xs text-gray-500 uppercase text-center mb-4">ВЛАДЕЛЕЦ</p>
              <div className="flex space-x-8">
                {state.employees
                  .filter(emp => emp.department === 'Владельцы')
                  .map((owner) => (
                    <div 
                      key={owner.id}
                      className="flex flex-col items-center cursor-pointer hover:opacity-80"
                      onClick={() => handleEmployeeClick(owner)}
                    >
                      <img
                        className="h-12 w-12 rounded-full border-2 border-white shadow-md mb-2"
                        src={owner.avatar}
                        alt={owner.name}
                      />
                      <p className="text-sm font-medium text-blue-600">{owner.name}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Connecting Line from Owners */}
          <div className="flex justify-center mb-8">
            <div className="w-px h-16 bg-gray-400"></div>
          </div>

          {/* First Row: 3 columns */}
          <div className="relative">
            {/* Horizontal Line connecting all 3 boxes */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4/5 h-px bg-gray-400" style={{ top: '-32px' }}></div>
            
            {/* Vertical Lines from horizontal to each box */}
            <div className="absolute left-[16.67%] w-px h-8 bg-gray-400" style={{ top: '-32px' }}></div>
            <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-8 bg-gray-400" style={{ top: '-32px' }}></div>
            <div className="absolute right-[16.67%] w-px h-8 bg-gray-400" style={{ top: '-32px' }}></div>

            <div className="grid grid-cols-3 gap-6 mb-8 max-w-5xl mx-auto">
            {/* Accounting Department */}
            <DepartmentCard
              title="ДЕПАРТАМЕНТ БУХГАЛТЕРИИ"
              subtitle="БУХГАЛТЕР"
              employees={state.employees.filter(e => e.position === 'Бухгалтер')}
              color="bg-yellow-100"
              result="АКТУАЛЬНЫЙ И ПОЛНЫЙ БУХГАЛТЕРСКИЙ УЧЕТ"
            />

            {/* CEO */}
            <DepartmentCard
              title="ГЕНЕРАЛЬНЫЙ ДИРЕКТОР"
              subtitle="ГЕНЕРАЛЬНЫЙ ДИРЕКТОР"
              employees={state.employees.filter(e => e.position === 'Генеральный директор')}
              color="bg-orange-100"
            />

            {/* Sales Center */}
            <DepartmentCard
              title="ЦЕНТР ПРОДАЖ ХОЛДИНГА"
              subtitle="ДИРЕКТОР ЦЕНТРА ПРОДАЖ"
              employees={state.employees.filter(e => e.email?.includes('zinnur.galimov'))}
              color="bg-pink-200"
            />
            </div>
          </div>

          {/* Connecting Line from CEO */}
          <div className="flex justify-center mb-8">
            <div className="w-px h-16 bg-gray-400"></div>
          </div>

          {/* Second Row: 5 columns under CEO */}
          <div className="relative">
            {/* Horizontal Line connecting all 5 boxes */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[90%] h-px bg-gray-400" style={{ top: '-32px' }}></div>
            
            {/* Vertical Lines from horizontal to each box */}
            <div className="absolute w-px h-8 bg-gray-400" style={{ left: '10%', top: '-32px' }}></div>
            <div className="absolute w-px h-8 bg-gray-400" style={{ left: '30%', top: '-32px' }}></div>
            <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-8 bg-gray-400" style={{ top: '-32px' }}></div>
            <div className="absolute w-px h-8 bg-gray-400" style={{ right: '30%', top: '-32px' }}></div>
            <div className="absolute w-px h-8 bg-gray-400" style={{ right: '10%', top: '-32px' }}></div>

            <div className="grid grid-cols-5 gap-4 max-w-7xl mx-auto">
            {/* HR Department */}
            <DepartmentCard
              title="HR ДЕПАРТАМЕНТ"
              subtitle="АССИСТЕНТ ГЕНЕРАЛЬНОГО ДИРЕКТОРА"
              employees={state.employees.filter(e => e.department === 'HR департамент')}
              color="bg-green-200"
              result="ЭФФЕКТИВНЫЕ СОТРУДНИКИ КОМПАНИИ, ДОСТИГАЮЩИЕ СВОИХ КPI"
            />

            {/* Quality Control */}
            <DepartmentCard
              title="КОНТРОЛЬ КАЧЕСТВА"
              subtitle="РУКОВОДИТЕЛЬ ОТДЕЛА КАЧЕСТВА"
              employees={state.employees.filter(e => e.department === 'Контроль качества')}
              color="bg-purple-200"
              result="СВОЕВРЕМЕННО ВЫЯВЛЕННЫЕ ОТКЛОНЕНИЯ И ИСПОЛНЕНИЯ УСЛУГ И ПРОЦЕССОВ"
            />

            {/* Marketing and Advertising */}
            <DepartmentCard
              title="ОТДЕЛ МАРКЕТИНГА И РЕКЛАМЫ"
              subtitle="РУКОВОДИТЕЛЬ ОТДЕЛА МАРКЕТИНГА И РЕКЛАМЫ"
              employees={state.employees.filter(e => e.department === 'Отдел маркетинга')}
              color="bg-blue-400 text-white"
              result="ЦЕЛЕВЫЕ ЛИДЫ, СООТВЕТСТВУЮЩИЕ СТРАТЕГИЧЕСКОМУ ПЛАНУ И МАРКЕТИНГОВОЙ СТРАТЕГИИ"
            />

            {/* Service Execution Department */}
            <div className="bg-pink-300 rounded-lg p-6 flex flex-col h-full">
              <div className="mb-4">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">ОТДЕЛ ИСПОЛНЕНИЯ УСЛУГ</h3>
                <p className="text-xs text-gray-700 uppercase">РУКОВОДИТЕЛЬ ОТДЕЛА ИСПОЛНЕНИЯ УСЛУГ</p>
              </div>
              
              <div className="flex-1 space-y-2 mb-4">
                {state.employees.filter(e => e.department === 'Отдел исполнения услуг').map((employee) => (
                  <EmployeeAvatar 
                    key={employee.id} 
                    employee={employee} 
                    onClick={() => handleEmployeeClick(employee)}
                  />
                ))}
              </div>

              {/* Project Management Section */}
              <div className="mb-4 pb-4 border-t border-white border-opacity-30 pt-4">
                <h4 className="text-xs font-bold text-gray-800 uppercase mb-1">УПРАВЛЕНИЕ ПРОЕКТАМИ</h4>
                <p className="text-xs text-gray-700 uppercase mb-3">ПРОЕКТ МЕНЕДЖЕР</p>
                <div className="space-y-2">
                  {state.employees
                    .filter(e => e.position?.includes('Проект'))
                    .slice(0, 2)
                    .map((emp) => (
                      <EmployeeAvatar 
                        key={emp.id} 
                        employee={emp}
                        onClick={() => handleEmployeeClick(emp)}
                      />
                    ))}
                </div>
              </div>

              {/* Agent Development Section */}
              <div className="mb-4 pb-4 border-t border-white border-opacity-30 pt-4">
                <h4 className="text-xs font-bold text-gray-800 uppercase mb-1">РАЗРАБОТКА АГЕНТОВ</h4>
                <p className="text-xs text-gray-700 uppercase mb-3">ИИ ИНЖЕНЕР</p>
                <div className="space-y-2">
                  {state.employees
                    .filter(e => e.position?.includes('инженер') || e.position?.includes('Инженер'))
                    .slice(0, 5)
                    .map((emp) => (
                      <EmployeeAvatar 
                        key={emp.id} 
                        employee={emp}
                        onClick={() => handleEmployeeClick(emp)}
                      />
                    ))}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white border-opacity-30">
                <p className="text-xs font-semibold text-gray-800 mb-1">РЕЗУЛЬТАТ:</p>
                <p className="text-xs text-gray-700">СВОЕВРЕМЕННО И КАЧЕСТВЕННО ПРОИЗВЕДЕННЫЙ ПРОДУКТ, ОКАЗАННАЯ УСЛУГА, ПЕРЕДАННАЯ КЛИЕНТУ</p>
              </div>
            </div>

            {/* Sales Department */}
            <div className="bg-purple-300 rounded-lg p-6 flex flex-col h-full">
              <div className="mb-4">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">ОТДЕЛ ПРОДАЖ</h3>
                <p className="text-xs text-gray-700 uppercase">РУКОВОДИТЕЛЬ ОТДЕЛА ПРОДАЖ</p>
              </div>
              
              <div className="flex-1 space-y-2 mb-4">
                {state.employees.filter(e => e.department === 'Отдел продаж').map((employee) => (
                  <EmployeeAvatar 
                    key={employee.id} 
                    employee={employee} 
                    onClick={() => handleEmployeeClick(employee)}
                  />
                ))}
              </div>

              {/* Cold Sales Department Section */}
              <div className="mb-4 pb-4 border-t border-white border-opacity-30 pt-4">
                <h4 className="text-xs font-bold text-gray-800 uppercase mb-1">ОТДЕЛ ХОЛОДНЫХ ПРОДАЖ</h4>
                <p className="text-xs text-gray-700 uppercase mb-3">МЕНЕДЖЕР ОТДЕЛА ПРОДАЖ</p>
                <div className="space-y-2">
                  {state.employees
                    .filter(e => e.department === 'Отдел продаж')
                    .slice(0, 1)
                    .map((emp) => (
                      <EmployeeAvatar 
                        key={emp.id} 
                        employee={emp}
                        onClick={() => handleEmployeeClick(emp)}
                      />
                    ))}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white border-opacity-30">
                <p className="text-xs font-semibold text-gray-800 mb-1">РЕЗУЛЬТАТ:</p>
                <p className="text-xs text-gray-700">КЛИЕНТ, ОПЛАТИВШИЙ ПРОДУКТ, ОТПРАВЛЕН В ОПЕРАЦИОННЫЙ БЛОК</p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedEmployee(null)}
          title={`Сотрудник: ${selectedEmployee.name}`}
          size="lg"
        >
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-start space-x-6">
                <img
                  className="h-32 w-32 rounded-lg object-cover"
                  src={selectedEmployee.avatar}
                  alt={selectedEmployee.name}
                />
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                    <Input value={selectedEmployee.name} readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input value={selectedEmployee.email || ''} readOnly />
                  </div>
                </div>
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                  <Input 
                    value={selectedEmployee.phone || ''} 
                    placeholder="Введите Телефон"
                    readOnly 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input value={selectedEmployee.email || ''} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slack</label>
                  <Input placeholder="Введите Slack" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telegram</label>
                  <Input placeholder="Введите Telegram" readOnly />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Примечание</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Введите Примечание"
                  rows={3}
                  readOnly
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата найма
                  </label>
                  <div className="relative">
                    <Input
                      value={formatShortDate(selectedEmployee.hireDate)}
                      readOnly
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата увольнения 🔒
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Выберите Дата увольнения"
                      readOnly
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ответственный HR ⓘ
                  </label>
                  <Input 
                    value={selectedEmployee.hr || 'Выберите сотрудника'} 
                    readOnly 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Рекрутер ⓘ 🔒
                  </label>
                  <Input 
                    value={selectedEmployee.recruiter || 'Выберите сотрудника'} 
                    readOnly 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'positions' && (
            <div className="text-center py-12 text-gray-500">
              <p>Информация о должностях будет доступна в следующей версии</p>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="text-center py-12 text-gray-500">
              <p>Информация о событиях будет доступна в следующей версии</p>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="text-center py-12 text-gray-500">
              <p>Информация о курсах будет доступна в следующей версии</p>
            </div>
          )}

          {activeTab === 'salary' && (
            <div className="text-center py-12 text-gray-500">
              <p>Информация о зарплате будет доступна в следующей версии</p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
