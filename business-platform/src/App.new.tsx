import React, { useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
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
import { api } from './services/api/axios.config';

function AppContent() {
  const { state, dispatch } = useApp();
  const { user, loading: authLoading, login, isAuthenticated } = useAuth();

  // Загружаем данные после авторизации
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      // Загружаем данные с backend
      const [employees, tasks, transactions] = await Promise.all([
        api.get('/employees').then(res => res.data),
        api.get('/tasks').then(res => res.data),
        api.get('/finances/transactions').then(res => res.data),
      ]);

      dispatch({ type: 'SET_EMPLOYEES', payload: employees });
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });

      // Пока используем моки для некоторых данных
      dispatch({ type: 'SET_NEWS', payload: [] });
      dispatch({ type: 'SET_ANNIVERSARIES', payload: [] });
      dispatch({ type: 'SET_EVENTS', payload: [] });
      dispatch({ type: 'SET_ABSENCES', payload: [] });
      dispatch({ type: 'SET_PASSWORDS', payload: [] });
      dispatch({ type: 'SET_PASSWORD_CATEGORIES', payload: [] });
      dispatch({ type: 'SET_ACCOUNTS', payload: [] });

      console.log('✅ Data loaded from backend');
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  // Показываем загрузку при проверке авторизации
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если не авторизован - показываем Login
  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  // Авторизован - показываем приложение
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
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

