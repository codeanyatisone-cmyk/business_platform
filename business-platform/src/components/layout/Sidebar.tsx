import React from 'react';
import { 
  X, 
  Building2, 
  Monitor, 
  BarChart3, 
  BookOpen, 
  GraduationCap, 
  DollarSign, 
  Calculator, 
  Shield, 
  Settings,
  Bell,
  Lock,
  User,
  UserCog,
  CheckSquare,
  Layout,
  Mail
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  const menuItems = [
    { 
      id: 'company', 
      label: 'КОМПАНИЯ', 
      icon: Building2,
      isSection: true,
      subItems: [
        { id: 'news', label: 'Новости' },
        { id: 'structure', label: 'Структура' },
        { id: 'employees', label: 'Сотрудники' },
        { id: 'anniversaries', label: 'Годовщины' },
        { id: 'events', label: 'Мероприятия' },
        { id: 'absences', label: 'Отсутствия (Beta)' },
        ...(isAdmin ? [
          { id: 'companies', label: 'Управление компаниями' },
          { id: 'departments', label: 'Управление отделами' },
        ] : []),
      ]
    },
    // { id: 'desktop', label: 'РАБОЧИЙ\nСТОЛ', icon: Monitor }, // Временно отключено
    // { id: 'dashboard', label: 'ДАШБОРД', icon: BarChart3 }, // Временно отключено
    ...(isAdmin ? [
      { id: 'statistics', label: 'СТАТИСТИКА', icon: BarChart3 },
    ] : []),
    { id: 'boards', label: 'ДОСКИ', icon: Layout },
    { id: 'tasks', label: 'ЗАДАЧИ', icon: CheckSquare },
    { id: 'knowledge', label: 'БАЗА\nЗНАНИЙ', icon: BookOpen },
    { id: 'academy', label: 'АКАДЕМИЯ', icon: GraduationCap },
    { id: 'finances', label: 'ФИНАНСЫ', icon: DollarSign },
    // { id: 'finplan', label: 'ФИНПЛАН', icon: Calculator }, // Временно отключено
    // { id: 'control', label: 'КОНТРОЛЬ\nКАЧ-ВА', icon: Shield }, // Временно отключено
    { id: 'passwords', label: 'ПАРОЛИ', icon: Lock },
    { id: 'mailbox', label: 'ПОЧТА', icon: Mail },
    // { id: 'projects', label: 'БИЗНЕС\nПРОЦ-СЫ', icon: Settings }, // Временно отключено
    { id: 'profile', label: 'ПРОФИЛЬ', icon: User },
    { id: 'admin', label: 'АДМИН\nПАНЕЛЬ', icon: UserCog, adminOnly: true },
  ];

  const handleTabChange = (tabId: string) => {
    dispatch({ type: 'SET_CURRENT_TAB', payload: tabId as any });
    onClose();
  };

  const toggleSection = (sectionId: string) => {
    if (sectionId === 'company') {
      // При клике на "Компания" открываем страницу "Новости" (первый подраздел)
      handleTabChange('news');
    }
  };

  const isCompanyPage = ['news', 'structure', 'employees', 'anniversaries', 'events', 'absences'].includes(state.currentTab);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-16 bg-white shadow-sm border-r border-gray-100 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:static lg:inset-0`}
      >
        {/* User Avatar */}
        <div className="flex items-center justify-center h-12 border-b border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-red-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">A</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-2">
          <div className="space-y-1 px-1">
            {menuItems.filter(item => !item.adminOnly || isAdmin).map((item) => {
              const IconComponent = item.icon;
              
              // Если это раздел с подразделами
              if (item.isSection) {
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => toggleSection(item.id)}
                      className={`w-14 h-12 flex flex-col items-center justify-center rounded-md transition-colors group ${
                        isCompanyPage
                          ? 'bg-pink-50 text-pink-600'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="h-4 w-4 mb-0.5" />
                      <span className="text-xs font-normal leading-none text-center whitespace-pre-line" style={{ fontSize: '10px' }}>
                        {item.label}
                      </span>
                    </button>
                  </div>
                );
              }
              
              // Обычные пункты меню
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-14 h-12 flex flex-col items-center justify-center rounded-md transition-colors group ${
                    state.currentTab === item.id
                      ? 'bg-pink-50 text-pink-600'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mb-0.5" />
                  <span className="text-xs font-normal leading-none text-center whitespace-pre-line" style={{ fontSize: '10px' }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-2 left-1 right-1">
          <button className="w-14 h-12 flex flex-col items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors relative">
            <Bell className="h-4 w-4 mb-0.5" />
            <span className="text-xs font-normal leading-none text-center whitespace-pre-line" style={{ fontSize: '10px' }}>УВЕДОМ{'\n'}ЛЕНИЯ</span>
            <div className="absolute top-1 right-1 w-4 h-4 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
              20
            </div>
          </button>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-gray-600 lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}