import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Inbox,
  RefreshCw,
  Trash2,
  Reply,
  Paperclip,
  Search,
  X,
  Key
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { api } from '../services/api/axios.config';

interface Email {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  preview: string;
  has_attachments: boolean;
}

interface EmailDetail {
  id: string;
  subject: string;
  from: string;
  to: string;
  cc: string;
  date: string;
  body_plain: string;
  body_html: string;
  attachments: Array<{
    filename: string;
    size: number;
  }>;
}

export function MailboxPage() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  // State
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('INBOX');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  
  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [mailboxPassword, setMailboxPassword] = useState('');
  
  // Compose email
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [sending, setSending] = useState(false);

  // Check if password is set on mount
  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/mailbox/emails?folder=${currentFolder}&limit=50`);
      if (response.data.success) {
        setEmails(response.data.emails);
        setIsPasswordSet(true);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setIsPasswordSet(false);
        setShowPasswordModal(true);
      } else {
        showNotification({ 
          message: 'Ошибка загрузки писем: ' + (error.response?.data?.detail || error.message), 
          type: 'error' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (!mailboxPassword) {
      showNotification({ message: 'Введите пароль', type: 'error' });
      return;
    }

    try {
      const response = await api.post('/mailbox/set-password', {
        password: mailboxPassword
      });

      if (response.data.success) {
        setIsPasswordSet(true);
        setShowPasswordModal(false);
        showNotification({ message: 'Пароль сохранен!', type: 'success' });
        loadEmails();
      }
    } catch (error: any) {
      showNotification({ 
        message: 'Ошибка сохранения пароля: ' + (error.response?.data?.detail || error.message), 
        type: 'error' 
      });
    }
  };

  const handleSelectEmail = async (emailId: string) => {
    try {
      const response = await api.get(`/mailbox/emails/${emailId}?folder=${currentFolder}`);
      if (response.data.success) {
        setSelectedEmail(response.data.email);
      }
    } catch (error: any) {
      showNotification({ 
        message: 'Ошибка загрузки письма: ' + (error.response?.data?.detail || error.message), 
        type: 'error' 
      });
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    if (!window.confirm('Удалить это письмо?')) return;

    try {
      const response = await api.delete(`/mailbox/emails/${emailId}?folder=${currentFolder}`);
      if (response.data.success) {
        showNotification({ message: 'Письмо удалено', type: 'success' });
        setSelectedEmail(null);
        loadEmails();
      }
    } catch (error: any) {
      showNotification({ 
        message: 'Ошибка удаления письма: ' + (error.response?.data?.detail || error.message), 
        type: 'error' 
      });
    }
  };

  const handleSendEmail = async () => {
    if (!composeTo || !composeSubject || !composeBody) {
      showNotification({ message: 'Заполните все обязательные поля', type: 'error' });
      return;
    }

    setSending(true);
    try {
      const response = await api.post('/mailbox/emails/send', {
        to: composeTo,
        subject: composeSubject,
        body: composeBody,
        cc: composeCc || undefined,
        is_html: false
      });

      if (response.data.success) {
        showNotification({ message: 'Письмо отправлено!', type: 'success' });
        setShowComposeModal(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        setComposeCc('');
      }
    } catch (error: any) {
      showNotification({ 
        message: 'Ошибка отправки письма: ' + (error.response?.data?.detail || error.message), 
        type: 'error' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleReply = () => {
    if (selectedEmail) {
      setComposeTo(selectedEmail.from);
      setComposeSubject(`Re: ${selectedEmail.subject}`);
      setComposeBody(`\n\n---\nОт: ${selectedEmail.from}\nДата: ${selectedEmail.date}\n\n${selectedEmail.body_plain}`);
      setShowComposeModal(true);
    }
  };

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.from.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isPasswordSet) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-center mb-6">
              <Mail className="h-16 w-16 text-pink-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Доступ к почте</h2>
              <p className="text-gray-600 mt-2">
                Введите пароль от вашего почтового ящика для доступа к письмам
              </p>
            </div>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Пароль почтового ящика"
                value={mailboxPassword}
                onChange={(e) => setMailboxPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSetPassword()}
              />
              <Button
                onClick={handleSetPassword}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                <Key className="h-4 w-4 mr-2" />
                Войти
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Почта</h1>
        <Button
          onClick={() => setShowComposeModal(true)}
          className="bg-pink-600 hover:bg-pink-700"
        >
          <Send className="h-4 w-4 mr-2" />
          Написать
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Email List */}
        <div className="col-span-4 bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Входящие</h2>
              <Button
                onClick={loadEmails}
                variant="secondary"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Поиск писем..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Mail className="h-12 w-12 mb-2" />
                <p>Нет писем</p>
              </div>
            ) : (
              filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => handleSelectEmail(email.id)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedEmail?.id === email.id ? 'bg-pink-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-gray-900 truncate flex-1">
                      {email.from}
                    </span>
                    {email.has_attachments && (
                      <Paperclip className="h-4 w-4 text-gray-400 ml-2" />
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900 truncate mb-1">
                    {email.subject}
                  </div>
                  <div className="text-sm text-gray-500 truncate mb-1">
                    {email.preview}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(email.date).toLocaleString('ru-RU')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Email Detail */}
        <div className="col-span-8 bg-white rounded-lg shadow">
          {selectedEmail ? (
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 flex-1">
                    {selectedEmail.subject}
                  </h1>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleReply}
                      variant="secondary"
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Ответить
                    </Button>
                    <Button
                      onClick={() => handleDeleteEmail(selectedEmail.id)}
                      variant="secondary"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-20">От:</span>
                    <span className="text-gray-900">{selectedEmail.from}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-20">Кому:</span>
                    <span className="text-gray-900">{selectedEmail.to}</span>
                  </div>
                  {selectedEmail.cc && (
                    <div className="flex">
                      <span className="font-semibold text-gray-700 w-20">Копия:</span>
                      <span className="text-gray-900">{selectedEmail.cc}</span>
                    </div>
                  )}
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-20">Дата:</span>
                    <span className="text-gray-900">
                      {new Date(selectedEmail.date).toLocaleString('ru-RU')}
                    </span>
                  </div>
                </div>

                {selectedEmail.attachments.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-sm text-gray-700 mb-2">
                      <Paperclip className="h-4 w-4 mr-2" />
                      <span className="font-semibold">
                        Вложения ({selectedEmail.attachments.length})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {selectedEmail.attachments.map((attachment, idx) => (
                        <div key={idx} className="text-sm text-gray-600">
                          {attachment.filename} ({Math.round(attachment.size / 1024)} KB)
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                {selectedEmail.body_html ? (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-gray-900">
                    {selectedEmail.body_plain}
                  </pre>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Mail className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Выберите письмо для просмотра</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <Modal isOpen={showComposeModal} onClose={() => setShowComposeModal(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Новое письмо</h2>
            <button
              onClick={() => setShowComposeModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Кому"
              value={composeTo}
              onChange={(e) => setComposeTo(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Копия (необязательно)"
              value={composeCc}
              onChange={(e) => setComposeCc(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Тема"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
            />
            <textarea
              placeholder="Текст письма"
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => setShowComposeModal(false)}
              variant="secondary"
              disabled={sending}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sending}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {sending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Отправить
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Password Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Изменить пароль</h2>
          <Input
            type="password"
            placeholder="Новый пароль"
            value={mailboxPassword}
            onChange={(e) => setMailboxPassword(e.target.value)}
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => setShowPasswordModal(false)}
              variant="secondary"
            >
              Отмена
            </Button>
            <Button onClick={handleSetPassword}>
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

