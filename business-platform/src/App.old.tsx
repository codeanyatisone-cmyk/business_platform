import React, { useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Layout } from './components/layout/Layout';
import { NewsPage } from './pages/NewsPage';
import { StructurePage } from './pages/StructurePage';
import { EmployeesPage } from './pages/EmployeesPage';
import { AnniversariesPage } from './pages/AnniversariesPage';
import { EventsPage } from './pages/EventsPage';
import { AbsencesPage } from './pages/AbsencesPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { AcademyPage } from './pages/AcademyPage';
import { PasswordsPage } from './pages/PasswordsPage';
import FinancesPage from './pages/FinancesPage';
// Mock data removed - using only backend data
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true';

function AppContent() {
  const { state, dispatch } = useApp();

  // Загружаем данные при инициализации
  useEffect(() => {
    // Загружаем данные из backend
    console.log('🚀 Loading data from backend...');
    // TODO: Implement data loading
    // Используем пустые массивы для данных, которые еще не реализованы в backend
    dispatch({ type: 'SET_NEWS', payload: [] });
    dispatch({ type: 'SET_ANNIVERSARIES', payload: [] });
    dispatch({ type: 'SET_EVENTS', payload: [] });
    dispatch({ type: 'SET_ABSENCES', payload: [] });
    dispatch({ type: 'SET_PASSWORDS', payload: [] });
    dispatch({ type: 'SET_PASSWORD_CATEGORIES', payload: [] });
    dispatch({ type: 'SET_ACCOUNTS', payload: [] });
  }, [dispatch]);

  // Показываем состояние загрузки

  const renderCurrentPage = () => {
    switch (state.currentTab) {
      case 'news':
        return <NewsPage />;
      case 'structure':
        return <StructurePage />;
      case 'employees':
        return <EmployeesPage />;
      case 'anniversaries':
        return <AnniversariesPage />;
      case 'events':
        return <EventsPage />;
      case 'absences':
        return <AbsencesPage />;
      case 'desktop':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Рабочий стол</h2>
            <p className="text-gray-600">Страница в разработке</p>
          </div>
        );
      case 'dashboard':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Дашборд</h2>
            <p className="text-gray-600">Страница в разработке</p>
          </div>
        );
      case 'knowledge':
        return <KnowledgeBasePage />;
      case 'academy':
        return <AcademyPage />;
      case 'finances':
        return <FinancesPage />;
      case 'finplan':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Финплан</h2>
            <p className="text-gray-600">Страница в разработке</p>
          </div>
        );
      case 'control':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Контроль качества</h2>
            <p className="text-gray-600">Страница в разработке</p>
          </div>
        );
      case 'projects':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Бизнес процессы</h2>
            <p className="text-gray-600">Страница в разработке</p>
          </div>
        );
      case 'passwords':
        return <PasswordsPage />;
      default:
        return <NewsPage />;
    }
  };

  // Страницы с собственным layout (только passwords без Layout)
  if (state.currentTab === 'passwords') {
    return <PasswordsPage />;
  }

  return (
    <Layout>
      {renderCurrentPage()}
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;