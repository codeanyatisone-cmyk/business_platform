import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Copy, Save, Trash2, Lock, Globe, User, Tag } from 'lucide-react';
import { Password, PasswordCategory } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useApp } from '../../contexts/AppContext';
import { useNotification } from '../../hooks/useNotification';

interface PasswordEditorProps {
  password?: Password;
  isOpen: boolean;
  onClose: () => void;
  onSave: (password: Partial<Password>) => void;
  onDelete?: (passwordId: number) => void;
}

export function PasswordEditor({ 
  password, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete 
}: PasswordEditorProps) {
  const { state } = useApp();
  const { showNotification } = useNotification();
  
  // State for password data
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [login, setLogin] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isPersonal, setIsPersonal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (password) {
      setName(password.name);
      setDescription(password.description || '');
      setUrl(password.url || '');
      setLogin(password.login);
      setPasswordValue(password.password);
      setCategoryId(password.categoryId);
      setIsPersonal(password.isPersonal);
      setIsEditing(true);
    } else {
      // Reset for new password
      setName('');
      setDescription('');
      setUrl('');
      setLogin('');
      setPasswordValue('');
      setCategoryId('');
      setIsPersonal(false);
      setIsEditing(false);
    }
  }, [password, isOpen]);

  const handleSave = () => {
    if (!name.trim()) {
      showNotification({
        message: 'Название пароля не может быть пустым',
        type: 'error'
      });
      return;
    }

    if (!login.trim()) {
      showNotification({
        message: 'Логин не может быть пустым',
        type: 'error'
      });
      return;
    }

    if (!passwordValue.trim()) {
      showNotification({
        message: 'Пароль не может быть пустым',
        type: 'error'
      });
      return;
    }

    const passwordData: Partial<Password> = {
      name: name.trim(),
      description: description.trim(),
      url: url.trim(),
      login: login.trim(),
      password: passwordValue.trim(),
      categoryId,
      isPersonal,
      category: state.passwordCategories.find(cat => cat.id === categoryId)?.name || 'Без категории',
      sharedWith: isPersonal ? [] : ['Текущий пользователь'],
      activeUsers: isPersonal ? 1 : 1
    };

    onSave(passwordData);
    onClose();
  };

  const handleDelete = () => {
    if (password && onDelete) {
      onDelete(password.id);
      onClose();
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(passwordValue);
    showNotification({
      message: 'Пароль скопирован в буфер обмена',
      type: 'success'
    });
  };

  const handleCopyLogin = () => {
    navigator.clipboard.writeText(login);
    showNotification({
      message: 'Логин скопирован в буфер обмена',
      type: 'success'
    });
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let generatedPassword = '';
    for (let i = 0; i < 16; i++) {
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordValue(generatedPassword);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative flex h-full">
        {/* Main Content */}
        <div className="flex-1 bg-white overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Lock className="h-6 w-6 text-gray-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isEditing ? 'Редактировать пароль' : 'Новый пароль'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isEditing ? `ID: ${password?.id}` : 'Создание нового пароля'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Сохранить</span>
                </Button>
                {isEditing && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Основная информация</h3>
                
                <Input
                  label="Название *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: GitHub, Gmail, AWS"
                  icon={<Lock className="h-4 w-4" />}
                />

                <Input
                  label="Описание"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Краткое описание пароля"
                />

                <Input
                  label="URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  icon={<Globe className="h-4 w-4" />}
                />
              </div>

              {/* Credentials */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Учетные данные</h3>
                
                <Input
                  label="Логин/Email *"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="user@example.com"
                  icon={<User className="h-4 w-4" />}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Пароль *
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordValue}
                        onChange={(e) => setPasswordValue(e.target.value)}
                        placeholder="Введите пароль"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-20"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={handleCopyPassword}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={generatePassword}
                    >
                      Генерировать
                    </Button>
                  </div>
                </div>
              </div>

              {/* Category and Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Категория и настройки</h3>
                
                <Select
                  label="Категория"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  options={[
                    { value: '', label: 'Выберите категорию' },
                    ...state.passwordCategories.map(category => ({
                      value: category.id,
                      label: category.name
                    }))
                  ]}
                />

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPersonal"
                    checked={isPersonal}
                    onChange={(e) => setIsPersonal(e.target.checked)}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <label htmlFor="isPersonal" className="text-sm font-medium text-gray-700">
                    Личный пароль
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Личные пароли видны только вам. Общие пароли доступны другим пользователям.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Быстрые действия</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="ghost"
                    onClick={handleCopyLogin}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Копировать логин</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleCopyPassword}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Копировать пароль</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
