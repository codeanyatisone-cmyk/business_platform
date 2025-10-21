import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopNavigation } from './TopNavigation';
import { CompanySelector } from '../ui/CompanySelector';
import { useNotification } from '../../hooks/useNotification';
import { Notification } from '../ui/Notification';
import { useApp } from '../../contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notifications, removeNotification } = useNotification();
  const { state } = useApp();
  
  // Проверяем, находимся ли мы в разделе "Компания"
  const isCompanySection = ['news', 'structure', 'employees', 'anniversaries', 'events', 'absences'].includes(state.currentTab);
  
  // Страницы которые должны использовать полную ширину
  const fullWidthPages = ['tasks', 'finances'];
  const isFullWidth = fullWidthPages.includes(state.currentTab);

  return (
    <div className="flex h-screen bg-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
          >
            <Menu className="h-6 w-6" />
          </button>
          <CompanySelector />
        </div>

        {/* Desktop company selector */}
        <div className="hidden lg:flex items-center justify-end p-4 bg-white border-b border-gray-100">
          <CompanySelector />
        </div>

        {isCompanySection && <TopNavigation />}
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className={`h-full ${!isFullWidth ? 'max-w-screen-2xl mx-auto' : ''}`}>
            {children}
          </div>
        </main>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-4">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            {...notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </div>
  );
}


