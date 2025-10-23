import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { NewsPage } from './pages/NewsPage';
import { StructurePage } from './pages/StructurePage';
import { EmployeesPage } from './pages/EmployeesPage';
import { AnniversariesPage } from './pages/AnniversariesPage';
import { EventsPage } from './pages/EventsPage';
import { AbsencesPage } from './pages/AbsencesPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { AcademyPage } from './pages/AcademyPage';
import { PasswordsPage } from './pages/PasswordsPage';
import { BoardsPage } from './pages/BoardsPage';
import { TasksPage } from './pages/TasksPage';
import { MailboxPage } from './pages/MailboxPage';
// import { StatisticsPage } from './pages/StatisticsPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import FinancesPage from './pages/FinancesPage';
// Mock data removed - using only backend data
import { api } from './services/api/axios.config';

function AppContent() {
  const { state, dispatch } = useApp();
  const { user, loading: authLoading, login, register, isAuthenticated } = useAuth();
  const [dataLoading, setDataLoading] = React.useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Загружаем данные после авторизации
  useEffect(() => {
    if (isAuthenticated) {
      setDataLoading(true);
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      console.log('🔄 Loading data from backend...');
      
      // Загружаем данные с backend
      const [employees, tasks, transactions] = await Promise.all([
        api.get('/employees').then(res => {
          console.log('Employees loaded:', res.data?.length || 0, 'items');
          // Transform employees to flatten department objects
          return res.data.map((employee: any) => ({
            ...employee,
            department: typeof employee.department === 'object' ? employee.department.name : employee.department,
            company: typeof employee.company === 'object' ? employee.company.name : employee.company,
          }));
        }),
        api.get('/tasks').then(res => {
          console.log('Tasks loaded:', res.data?.length || 0, 'items');
          // Transform tasks to flatten assignee and creator objects
          return res.data.map((task: any) => ({
            ...task,
            assignee: task.assignee?.name || task.assignee,
            assigneeAvatar: task.assignee?.avatar || task.assigneeAvatar,
            creator: task.creator?.name || task.creator,
            creatorAvatar: task.creator?.avatar || task.creatorAvatar,
            // Ensure department and company are strings, not objects
            department: typeof task.assignee?.department === 'object' ? task.assignee.department.name : task.assignee?.department,
            company: typeof task.company === 'object' ? task.company.name : task.company,
          }));
        }),
        api.get('/finances/transactions').then(res => {
          console.log('Transactions loaded:', res.data?.length || 0, 'items');
          return res.data;
        }),
      ]);

      dispatch({ type: 'SET_EMPLOYEES', payload: employees });
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });

      // Используем пустые массивы для данных, которые еще не реализованы в backend
      dispatch({ type: 'SET_NEWS', payload: [] });
      dispatch({ type: 'SET_ANNIVERSARIES', payload: [] });
      dispatch({ type: 'SET_EVENTS', payload: [] });
      dispatch({ type: 'SET_ABSENCES', payload: [] });
      dispatch({ type: 'SET_PASSWORDS', payload: [] });
      dispatch({ type: 'SET_PASSWORD_CATEGORIES', payload: [] });
      dispatch({ type: 'SET_ACCOUNTS', payload: [] });

      console.log('✅ Data loaded from backend');
    } catch (error: any) {
      console.error('❌ Failed to load data:', error.message);
      // При ошибке используем пустые массивы
      dispatch({ type: 'SET_NEWS', payload: [] });
      dispatch({ type: 'SET_ANNIVERSARIES', payload: [] });
      dispatch({ type: 'SET_EVENTS', payload: [] });
      dispatch({ type: 'SET_ABSENCES', payload: [] });
      dispatch({ type: 'SET_PASSWORDS', payload: [] });
      dispatch({ type: 'SET_PASSWORD_CATEGORIES', payload: [] });
      dispatch({ type: 'SET_ACCOUNTS', payload: [] });
    } finally {
      setDataLoading(false);
    }
  };

  // Показываем загрузку при проверке авторизации или загрузке данных
  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? 'Проверка авторизации...' : 'Загрузка данных...'}
          </p>
        </div>
      </div>
    );
  }

  // Если не авторизован - показываем Login или Register
  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <RegisterPage 
          onRegister={register} 
          onBackToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <LoginPage 
        onLogin={login} 
        onRegister={() => setShowRegister(true)}
      />
    );
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
      case 'statistics':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Статистика</h2>
            <p className="text-gray-600">Страница в разработке</p>
          </div>
        );
      case 'boards':
        return <BoardsPage />;
      case 'tasks':
        return <TasksPage />;
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
      case 'mailbox':
        return <MailboxPage />;
      case 'profile':
        return <ProfilePage />;
      case 'admin':
        return <AdminPage />;
      case 'companies':
        return <CompaniesPage />;
      case 'departments':
        return <DepartmentsPage />;
      default:
        return <NewsPage />;
    }
  };

  // Страницы с собственным layout (без Layout wrapper)
  if (state.currentTab === 'passwords' || state.currentTab === 'mailbox') {
    return renderCurrentPage();
  }

  // ProfilePage и AdminPage теперь рендерятся внутри Layout через renderCurrentPage()
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

