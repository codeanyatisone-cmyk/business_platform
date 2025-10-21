import React, { useState, useRef } from 'react';
import { User as UserIcon, Save, Edit2, Key, Mail, Phone, Calendar, Briefcase, Building, Camera, Upload } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { api } from '../services/api/axios.config';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const [editMode, setEditMode] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  const [formData, setFormData] = useState({
    name: user?.employee?.name || '',
    email: user?.email || '',
    phone: user?.employee?.phone || '',
    position: user?.employee?.position || '',
    department: user?.employee?.department || '',
    birthDate: user?.employee?.birthDate ? new Date(user.employee.birthDate).toISOString().split('T')[0] : '',
    hireDate: user?.employee?.hireDate ? new Date(user.employee.hireDate).toISOString().split('T')[0] : '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        showNotification({
          message: 'Пожалуйста, выберите изображение',
          type: 'error',
        });
        return;
      }

      // Проверка размера (макс 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification({
          message: 'Размер файла не должен превышать 5MB',
          type: 'error',
        });
        return;
      }

      setAvatarFile(file);

      // Создаем preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      // Если есть новая аватарка, сначала загружаем её
      let avatarUrl = user?.employee?.avatar;
      
      if (avatarFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('avatar', avatarFile);

        const uploadResponse = await api.post(`/employees/${user?.employee?.id}/avatar`, formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        avatarUrl = uploadResponse.data.avatar;
      }

      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
        birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
      };

      if (avatarUrl && avatarFile) {
        updateData.avatar = avatarUrl;
      }

      // Админы могут редактировать должность, отдел и дату найма
      if (isAdmin) {
        updateData.position = formData.position;
        updateData.department = formData.department;
        updateData.hireDate = formData.hireDate ? new Date(formData.hireDate) : undefined;
      }

      await api.put(`/employees/${user?.employee?.id}`, updateData);

      showNotification({
        message: 'Профиль успешно обновлен!',
        type: 'success',
      });
      
      setEditMode(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Reload page to update data
      window.location.reload();
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Ошибка обновления профиля',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification({
        message: 'Пароли не совпадают',
        type: 'error',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showNotification({
        message: 'Пароль должен содержать минимум 6 символов',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      showNotification({
        message: 'Пароль успешно изменен!',
        type: 'success',
      });
      
      setChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Ошибка изменения пароля',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Мой профиль</h1>
          <p className="mt-2 text-sm text-gray-600">
            Управляйте своей личной информацией
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-pink-500 to-blue-500"></div>

          {/* Avatar and basic info */}
          <div className="px-6 py-5">
            <div className="flex items-start -mt-16 mb-6">
              <div className="relative group">
                {avatarPreview || user.employee?.avatar ? (
                  <img
                    src={avatarPreview || user.employee?.avatar}
                    alt={user.employee?.name}
                    className="h-24 w-24 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-pink-400 to-blue-400 flex items-center justify-center">
                    <UserIcon className="h-12 w-12 text-white" />
                  </div>
                )}
                
                {editMode && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 transition-colors"
                      title="Изменить фото"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

              <div className="ml-6 flex-1 mt-16">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.employee?.name}</h2>
                    <p className="text-sm text-gray-600">{user.employee?.position}</p>
                  </div>

                  {!editMode && !changePassword && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Edit2 className="h-4 w-4" />}
                      onClick={() => setEditMode(true)}
                    >
                      Редактировать
                    </Button>
                  )}
                </div>

                {/* Role Badge */}
                <div className="mt-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : user.role === 'manager'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role === 'admin' && '👑 Администратор'}
                    {user.role === 'manager' && '⭐ Менеджер'}
                    {user.role === 'user' && '👤 Пользователь'}
                  </span>
                </div>
              </div>
            </div>

            {/* Information */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Контактная информация</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email
                    </label>
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!editMode}
                      readOnly
                    />
                    <p className="mt-1 text-xs text-gray-500">Email нельзя изменить</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Телефон
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!editMode || loading}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Рабочая информация</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Briefcase className="h-4 w-4 inline mr-2" />
                      Должность
                    </label>
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      disabled={!editMode || loading || !isAdmin}
                      readOnly={!isAdmin}
                    />
                    {!isAdmin && (
                      <p className="mt-1 text-xs text-gray-500">Только администраторы могут изменить должность</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building className="h-4 w-4 inline mr-2" />
                      Отдел
                    </label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      disabled={!editMode || loading || !isAdmin}
                      readOnly={!isAdmin}
                    />
                    {!isAdmin && (
                      <p className="mt-1 text-xs text-gray-500">Только администраторы могут изменить отдел</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Дата найма
                    </label>
                    <Input
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                      disabled={!editMode || loading || !isAdmin}
                      readOnly={!isAdmin}
                    />
                    {!isAdmin && (
                      <p className="mt-1 text-xs text-gray-500">Только администраторы могут изменить дату найма</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Дата рождения
                    </label>
                    <Input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      disabled={!editMode || loading}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {editMode && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    icon={<Save className="h-4 w-4" />}
                  >
                    {loading ? 'Сохранение...' : 'Сохранить изменения'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        name: user?.employee?.name || '',
                        email: user?.email || '',
                        phone: user?.employee?.phone || '',
                        position: user?.employee?.position || '',
                        department: user?.employee?.department || '',
                        birthDate: user?.employee?.birthDate ? new Date(user.employee.birthDate).toISOString().split('T')[0] : '',
                        hireDate: user?.employee?.hireDate ? new Date(user.employee.hireDate).toISOString().split('T')[0] : '',
                      });
                    }}
                    disabled={loading}
                  >
                    Отмена
                  </Button>
                </div>
              )}

              {/* Change Password Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Безопасность</h3>
                    <p className="text-sm text-gray-600">Управление паролем</p>
                  </div>
                  
                  {!changePassword && !editMode && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Key className="h-4 w-4" />}
                      onClick={() => setChangePassword(true)}
                    >
                      Изменить пароль
                    </Button>
                  )}
                </div>

                {changePassword && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Текущий пароль
                      </label>
                      <Input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Введите текущий пароль"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Новый пароль
                      </label>
                      <Input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Минимум 6 символов"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Подтвердите новый пароль
                      </label>
                      <Input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Повторите новый пароль"
                        disabled={loading}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleChangePassword}
                        disabled={loading}
                      >
                        {loading ? 'Изменение...' : 'Изменить пароль'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setChangePassword(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                        }}
                        disabled={loading}
                      >
                        Отмена
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

