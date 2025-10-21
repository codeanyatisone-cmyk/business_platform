import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { TabType } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { classNames } from '../../utils';

const tabs = [
  { id: 'news' as TabType, label: 'Новости' },
  { id: 'structure' as TabType, label: 'Структура' },
  { id: 'employees' as TabType, label: 'Сотрудники' },
  { id: 'anniversaries' as TabType, label: 'Годовщины' },
  { id: 'events' as TabType, label: 'Мероприятия' },
  { id: 'absences' as TabType, label: 'Отсутствия (Beta)' },
];

export function TopNavigation() {
  const { state, dispatch } = useApp();
  const { user, logout } = useAuth();

  const handleTabChange = (tabId: TabType) => {
    dispatch({ type: 'SET_CURRENT_TAB', payload: tabId });
  };

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="flex items-center justify-between px-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={classNames(
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                state.currentTab === tab.id
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* User Info and Logout */}
        <div className="flex items-center gap-4">
          {user?.employee && (
            <div className="flex items-center gap-2 text-sm">
              {user.employee.avatar ? (
                <img
                  src={user.employee.avatar}
                  alt={user.employee.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-blue-400 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-gray-700 font-medium">{user.employee.name}</span>
            </div>
          )}
          
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            title="Выйти"
          >
            <LogOut className="w-4 h-4" />
            <span>Выйти</span>
          </button>
        </div>
      </div>
    </header>
  );
}


