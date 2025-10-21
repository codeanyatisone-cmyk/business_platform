import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Eye, EyeOff, Copy, Lock, AlertTriangle, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Sidebar } from '../components/layout/Sidebar';
import { Notification } from '../components/ui/Notification';
import { PasswordEditor } from '../components/passwords/PasswordEditor';
import { useApp } from '../contexts/AppContext';
import { useNotification } from '../hooks/useNotification';
import { passwordsApi } from '../services/api/passwords.api';
import { Password, PasswordCategory } from '../types';

export function PasswordsPage() {
  const { state, dispatch } = useApp();
  const { showNotification, notifications, removeNotification } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'shared'>('personal');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  
  // Password editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | undefined>();
  const [loading, setLoading] = useState(false);
  
  // Local state for passwords and categories
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [categories, setCategories] = useState<PasswordCategory[]>([]);


  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [passwordsData, categoriesData] = await Promise.all([
        passwordsApi.getPasswords(),
        passwordsApi.getPasswordCategories()
      ]);
      
      setPasswords(passwordsData);
      setCategories(categoriesData);
      
      // Update context with loaded data
      dispatch({ type: 'SET_PASSWORDS', payload: passwordsData });
      dispatch({ type: 'SET_PASSWORD_CATEGORIES', payload: categoriesData });
    } catch (error) {
      console.error('Failed to load passwords data:', error);
      showNotification({
        message: 'Ошибка при загрузке данных',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Password editor handlers
  const handleCreatePassword = () => {
    setEditingPassword(undefined);
    setIsEditorOpen(true);
  };

  const handleEditPassword = (password: Password) => {
    setEditingPassword(password);
    setIsEditorOpen(true);
  };

  const handleSavePassword = async (passwordData: Partial<Password>) => {
    try {
      if (editingPassword) {
        // Update existing password
        const updatedPassword = await passwordsApi.updatePassword(editingPassword.id, passwordData);
        setPasswords(passwords.map(p => p.id === editingPassword.id ? updatedPassword : p));
        dispatch({ type: 'UPDATE_PASSWORD', payload: updatedPassword });
        showNotification({
          message: 'Пароль успешно обновлен',
          type: 'success'
        });
      } else {
        // Create new password
        const newPassword = await passwordsApi.createPassword(passwordData);
        setPasswords([...passwords, newPassword]);
        dispatch({ type: 'ADD_PASSWORD', payload: newPassword });
        showNotification({
          message: 'Пароль успешно создан',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Failed to save password:', error);
      showNotification({
        message: 'Ошибка при сохранении пароля',
        type: 'error'
      });
    }
  };

  const handleDeletePassword = async (passwordId: number) => {
    try {
      await passwordsApi.deletePassword(passwordId);
      setPasswords(passwords.filter(p => p.id !== passwordId));
      dispatch({ type: 'DELETE_PASSWORD', payload: passwordId });
      showNotification({
        message: 'Пароль успешно удален',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to delete password:', error);
      showNotification({
        message: 'Ошибка при удалении пароля',
        type: 'error'
      });
    }
  };

  // Фильтрация паролей
  const filteredPasswords = useMemo(() => {
    return passwords.filter(password => {
      // Фильтр по типу (личные/общие)
      const matchesTab = activeTab === 'personal' ? password.isPersonal : !password.isPersonal;
      
      // Фильтр по категории
      const matchesCategory = selectedCategory === 'all' || password.categoryId === selectedCategory;
      
      // Фильтр по поиску
      const matchesSearch = !searchTerm || 
        password.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        password.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        password.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        password.login.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTab && matchesCategory && matchesSearch;
    });
  }, [passwords, activeTab, selectedCategory, searchTerm]);

  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    showNotification({
      message: 'Пароль скопирован в буфер обмена',
      type: 'success',
    });
  };

  const handleCopyLogin = (login: string) => {
    navigator.clipboard.writeText(login);
    showNotification({
      message: 'Логин скопирован в буфер обмена',
      type: 'success',
    });
  };

  const togglePasswordVisibility = (passwordId: number) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(passwordId)) {
        newSet.delete(passwordId);
      } else {
        newSet.add(passwordId);
      }
      return newSet;
    });
  };


  return (
    <div className="flex h-screen bg-white">
      {/* Main Sidebar with Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-1 h-screen bg-gray-50 overflow-hidden">
        {/* Left Sidebar with Categories */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Управление паролями</h1>
        </div>

        {/* Search in Categories */}
        <div className="p-4 border-b border-gray-200">
          <Input
            placeholder="Поиск по паролям"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-2">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setActiveTab('personal');
              }}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md mb-1 transition-colors ${
                selectedCategory === 'all' && activeTab === 'personal'
                  ? 'bg-pink-50 text-pink-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Lock className="h-4 w-4 mr-2" />
              Личные
            </button>
            
            <button
              onClick={() => {
                setSelectedCategory('all');
                setActiveTab('shared');
              }}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md mb-1 transition-colors ${
                selectedCategory === 'all' && activeTab === 'shared'
                  ? 'bg-pink-50 text-pink-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChevronRight className="h-4 w-4 mr-2" />
              Доступные мне
            </button>

            <div className="my-3 border-t border-gray-200"></div>

            {categories.filter(cat => !cat.isPersonal && cat.id !== 'shared').map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setActiveTab('shared');
                }}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md mb-1 transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                {category.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Add Category Button */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            className="w-full justify-start"
          >
            Добавить категорию
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'personal'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Личные
            </button>
            <button
              onClick={() => setActiveTab('shared')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'shared'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Доступные мне
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="mr-2 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              Показать архивные
            </label>
            <Button icon={<Plus className="h-4 w-4" />} onClick={handleCreatePassword}>
              Добавить пароль
            </Button>
          </div>
        </div>

        {/* Passwords Table */}
        <div className="flex-1 overflow-auto">
          {filteredPasswords.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Нет паролей</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'Попробуйте изменить параметры поиска' : 'Добавьте первый пароль'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Название
                    </th>
                    {activeTab === 'shared' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Категория
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Логин
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Пароль
                    </th>
                    {activeTab === 'shared' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Кому доступен
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Отредактирован
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Обновлен
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPasswords.map((password) => (
                    <tr key={password.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {password.hasWarning && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                          )}
                          <span className="text-sm text-gray-900">{password.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{password.name}</div>
                          {password.description && (
                            <div className="text-gray-500 text-xs mt-1">{password.description}</div>
                          )}
                        </div>
                      </td>
                      {activeTab === 'shared' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {password.category}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {password.url && (
                          <a
                            href={`https://${password.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {password.url}
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">{password.login}</span>
                          <button
                            onClick={() => handleCopyLogin(password.login)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900 font-mono">
                            {visiblePasswords.has(password.id) ? 'password123' : password.password}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(password.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {visiblePasswords.has(password.id) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopyPassword('password123')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      {activeTab === 'shared' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {password.sharedWith?.map((user, idx) => {
                              const displayText = typeof user === 'string' 
                                ? user 
                                : (user as any)?.name || String(user);
                              return (
                                <div key={idx} className={idx === 1 ? 'text-red-600' : ''}>
                                  {displayText}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {password.updatedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {password.updatedAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditPassword(password)}
                            className="text-gray-400 hover:text-blue-600"
                            title="Редактировать"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePassword(password.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
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

      {/* Password Editor */}
      <PasswordEditor
        password={editingPassword}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSavePassword}
        onDelete={handleDeletePassword}
      />
    </div>
  );
}

