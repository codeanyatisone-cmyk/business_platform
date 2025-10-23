import React, { useState, useEffect } from 'react';
import { Mail, ExternalLink, Settings, RefreshCw, CheckCircle, AlertCircle, Globe, Server, Lock, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { api } from '../services/api/axios.config';

interface MailboxInfo {
  email: string;
  status: string;
  quota: string;
  webmail_url: string;
  imap_server: string;
  smtp_server: string;
  imap_port: number;
  smtp_port: number;
}

interface WebmailInstructions {
  login: string;
  imap_settings: {
    server: string;
    port: number;
    security: string;
  };
  smtp_settings: {
    server: string;
    port: number;
    security: string;
  };
}

export function MailboxPage() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [mailboxInfo, setMailboxInfo] = useState<MailboxInfo | null>(null);
  const [webmailInstructions, setWebmailInstructions] = useState<WebmailInstructions | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingMailbox, setCreatingMailbox] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  
  // Form states
  const [mailboxPassword, setMailboxPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadMailboxInfo();
  }, []);

  const loadMailboxInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mailbox/info');
      
      if (response.data.success) {
        setMailboxInfo(response.data.mailbox);
      } else {
        // Mailbox doesn't exist yet
        setMailboxInfo(null);
      }
    } catch (error: any) {
      console.error('Error loading mailbox info:', error);
      if (error.response?.status === 404) {
        setMailboxInfo(null);
      } else {
        showNotification('Ошибка загрузки информации о почтовом ящике', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadWebmailInstructions = async () => {
    try {
      const response = await api.get('/mailbox/webmail-url');
      setWebmailInstructions(response.data.instructions);
    } catch (error) {
      console.error('Error loading webmail instructions:', error);
    }
  };

  const handleCreateMailbox = async () => {
    if (!mailboxPassword) {
      showNotification('Введите пароль для почтового ящика', 'error');
      return;
    }

    try {
      setCreatingMailbox(true);
      const response = await api.post('/mailbox/create', {
        password: mailboxPassword
      });

      if (response.data.success) {
        showNotification('Почтовый ящик успешно создан!', 'success');
        setShowCreateModal(false);
        setMailboxPassword('');
        await loadMailboxInfo();
      } else {
        showNotification(response.data.message || 'Ошибка создания почтового ящика', 'error');
      }
    } catch (error: any) {
      console.error('Error creating mailbox:', error);
      showNotification(
        error.response?.data?.detail || 'Ошибка создания почтового ящика',
        'error'
      );
    } finally {
      setCreatingMailbox(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      showNotification('Заполните все поля пароля', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification('Пароли не совпадают', 'error');
      return;
    }

    try {
      setUpdatingPassword(true);
      const response = await api.post('/mailbox/update-password', {
        new_password: newPassword
      });

      if (response.data.success) {
        showNotification('Пароль почтового ящика обновлен!', 'success');
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showNotification(response.data.message || 'Ошибка обновления пароля', 'error');
      }
    } catch (error: any) {
      console.error('Error updating password:', error);
      showNotification(
        error.response?.data?.detail || 'Ошибка обновления пароля',
        'error'
      );
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleOpenWebmail = () => {
    if (mailboxInfo?.webmail_url) {
      window.open(mailboxInfo.webmail_url, '_blank');
    }
  };

  const handleShowInstructions = async () => {
    await loadWebmailInstructions();
    setShowInstructionsModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка информации о почтовом ящике...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-pink-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Почтовый ящик</h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={loadMailboxInfo}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!mailboxInfo ? (
          // Mailbox doesn't exist - show creation option
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-pink-100 mb-4">
                <Mail className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Почтовый ящик не создан
              </h3>
              <p className="text-gray-600 mb-6">
                У вас еще нет почтового ящика. Создайте его для доступа к корпоративной почте.
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                Создать почтовый ящик
              </Button>
            </div>
          </div>
        ) : (
          // Mailbox exists - show info and controls
          <div className="space-y-6">
            {/* Mailbox Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Статус почтового ящика</h3>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Активен
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Основная информация</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{mailboxInfo.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Server className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Квота: {mailboxInfo.quota}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Настройки серверов</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">IMAP: {mailboxInfo.imap_server}:{mailboxInfo.imap_port}</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">SMTP: {mailboxInfo.smtp_server}:{mailboxInfo.smtp_port}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={handleOpenWebmail}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Открыть веб-почту
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(true)}
                className="w-full"
              >
                <Lock className="h-4 w-4 mr-2" />
                Изменить пароль
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShowInstructions}
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                Настройки почты
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Mailbox Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Создание почтового ящика"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Важно!</p>
                <p>Пароль для почтового ящика должен быть надежным и отличаться от пароля вашего аккаунта в бизнес-платформе.</p>
              </div>
            </div>
          </div>
          
          <Input
            label="Пароль для почтового ящика"
            type="password"
            value={mailboxPassword}
            onChange={(e) => setMailboxPassword(e.target.value)}
            placeholder="Введите надежный пароль"
            required
          />
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreateMailbox}
              disabled={creatingMailbox || !mailboxPassword}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {creatingMailbox ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Update Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Изменение пароля почтового ящика"
      >
        <div className="space-y-4">
          <Input
            label="Новый пароль"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Введите новый пароль"
            required
          />
          
          <Input
            label="Подтверждение пароля"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Подтвердите новый пароль"
            required
          />
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleUpdatePassword}
              disabled={updatingPassword || !newPassword || !confirmPassword}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {updatingPassword ? 'Обновление...' : 'Обновить'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Instructions Modal */}
      <Modal
        isOpen={showInstructionsModal}
        onClose={() => setShowInstructionsModal(false)}
        title="Настройки почтового клиента"
      >
        <div className="space-y-6">
          {webmailInstructions && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <div className="text-sm text-green-700">
                    <p className="font-medium">Вход в веб-почту</p>
                    <p>{webmailInstructions.login}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-md p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Server className="h-4 w-4 mr-2" />
                    Настройки IMAP (входящая почта)
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Сервер:</strong> {webmailInstructions.imap_settings.server}</div>
                    <div><strong>Порт:</strong> {webmailInstructions.imap_settings.port}</div>
                    <div><strong>Безопасность:</strong> {webmailInstructions.imap_settings.security}</div>
                    <div><strong>Логин:</strong> {user?.email}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-md p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Server className="h-4 w-4 mr-2" />
                    Настройки SMTP (исходящая почта)
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Сервер:</strong> {webmailInstructions.smtp_settings.server}</div>
                    <div><strong>Порт:</strong> {webmailInstructions.smtp_settings.port}</div>
                    <div><strong>Безопасность:</strong> {webmailInstructions.smtp_settings.security}</div>
                    <div><strong>Логин:</strong> {user?.email}</div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="flex justify-end">
            <Button
              onClick={() => setShowInstructionsModal(false)}
              className="bg-pink-600 hover:bg-pink-700"
            >
              Понятно
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}



