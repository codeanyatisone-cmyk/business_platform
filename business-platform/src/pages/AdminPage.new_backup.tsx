import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Building2,
  Mail,
  Plus,
  Edit2,
  Trash2,
  Search,
  Save,
  X,
  Key,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { api } from '../services/api/axios.config';

type TabType = 'users' | 'departments' | 'mailboxes';

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
  created_at: string;
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    department_id?: number;
  };
}

interface Department {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  manager_id?: number;
  company_id: number;
  created_at: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  position?: string;
  department_id?: number;
  company_id: number;
  user_id?: number;
}

export function AdminPage() {
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    email: '',
    username: '',
    password: '',
    role: 'EMPLOYEE',
    first_name: '',
    last_name: '',
    position: '',
    department_id: ''
  });
  
  // Departments state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    description: '',
    parent_id: '',
    company_id: '1'
  });
  
  // Employees state
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // Mailbox state
  const [showMailboxModal, setShowMailboxModal] = useState(false);
  const [selectedUserForMailbox, setSelectedUserForMailbox] = useState<User | null>(null);
  const [mailboxPassword, setMailboxPassword] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        await loadUsers();
      } else if (activeTab === 'departments') {
        await loadDepartments();
      }
      await loadEmployees();
    } catch (error: any) {
      showNotification({
        message: 'Ошибка загрузки данных: ' + (error.response?.data?.detail || error.message),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Пока используем mock данные, так как endpoint может не существовать
      // В реальности нужно создать endpoint GET /api/v1/users
      const response = await api.get('/employees');
      if (response.data) {
        // Преобразуем employees в users формат
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await api.get('/departments');
      if (response.data) {
        setDepartments(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await api.get('/employees');
      if (response.data) {
        setEmployees(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleCreateUser = async () => {
    if (!userForm.email || !userForm.password || !userForm.first_name || !userForm.last_name) {
      showNotification({ message: 'Заполните все обязательные поля', type: 'error' });
      return;
    }

    try {
      // Создаем пользователя
      const userResponse = await api.post('/auth/register', {
        email: userForm.email,
        username: userForm.username || userForm.email,
        password: userForm.password,
        role: userForm.role
      });

      if (userResponse.data) {
        // Создаем employee
        await api.post('/employees', {
          first_name: userForm.first_name,
          last_name: userForm.last_name,
          email: userForm.email,
          position: userForm.position,
          department_id: userForm.department_id ? parseInt(userForm.department_id) : null,
          company_id: 1
        });

        showNotification({ message: 'Пользователь создан успешно!', type: 'success' });
        setShowUserModal(false);
        resetUserForm();
        loadData();
      }
    } catch (error: any) {
      showNotification({
        message: 'Ошибка создания пользователя: ' + (error.response?.data?.detail || error.message),
        type: 'error'
      });
    }
  };

  const handleCreateDepartment = async () => {
    if (!departmentForm.name) {
      showNotification({ message: 'Введите название отдела', type: 'error' });
      return;
    }

    try {
      const response = await api.post('/departments', {
        name: departmentForm.name,
        description: departmentForm.description,
        parent_id: departmentForm.parent_id ? parseInt(departmentForm.parent_id) : null,
        company_id: parseInt(departmentForm.company_id)
      });

      if (response.data) {
        showNotification({ message: 'Отдел создан успешно!', type: 'success' });
        setShowDepartmentModal(false);
        resetDepartmentForm();
        loadData();
      }
    } catch (error: any) {
      showNotification({
        message: 'Ошибка создания отдела: ' + (error.response?.data?.detail || error.message),
        type: 'error'
      });
    }
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment || !departmentForm.name) {
      return;
    }

    try {
      const response = await api.put(`/departments/${editingDepartment.id}`, {
        name: departmentForm.name,
        description: departmentForm.description,
        parent_id: departmentForm.parent_id ? parseInt(departmentForm.parent_id) : null
      });

      if (response.data) {
        showNotification({ message: 'Отдел обновлен успешно!', type: 'success' });
        setShowDepartmentModal(false);
        setEditingDepartment(null);
        resetDepartmentForm();
        loadData();
      }
    } catch (error: any) {
      showNotification({
        message: 'Ошибка обновления отдела: ' + (error.response?.data?.detail || error.message),
        type: 'error'
      });
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот отдел?')) {
      return;
    }

    try {
      await api.delete(`/departments/${id}`);
      showNotification({ message: 'Отдел удален успешно!', type: 'success' });
      loadData();
    } catch (error: any) {
      showNotification({
        message: 'Ошибка удаления отдела: ' + (error.response?.data?.detail || error.message),
        type: 'error'
      });
    }
  };

  const handleCreateMailbox = async () => {
    if (!selectedUserForMailbox || !mailboxPassword) {
      showNotification({ message: 'Заполните все поля', type: 'error' });
      return;
    }

    try {
      // Сначала создаем mailbox в Mailcow
      const response = await api.post('/mailbox/create', {
        password: mailboxPassword
      });

      if (response.data.success) {
        showNotification({ message: 'Почтовый ящик создан успешно!', type: 'success' });
        setShowMailboxModal(false);
        setSelectedUserForMailbox(null);
        setMailboxPassword('');
      }
    } catch (error: any) {
      showNotification({
        message: 'Ошибка создания почтового ящика: ' + (error.response?.data?.detail || error.message),
        type: 'error'
      });
    }
  };

  const resetUserForm = () => {
    setUserForm({
      email: '',
      username: '',
      password: '',
      role: 'EMPLOYEE',
      first_name: '',
      last_name: '',
      position: '',
      department_id: ''
    });
  };

  const resetDepartmentForm = () => {
    setDepartmentForm({
      name: '',
      description: '',
      parent_id: '',
      company_id: '1'
    });
  };

  const openEditDepartment = (dept: Department) => {
    setEditingDepartment(dept);
    setDepartmentForm({
      name: dept.name,
      description: dept.description || '',
      parent_id: dept.parent_id?.toString() || '',
      company_id: dept.company_id.toString()
    });
    setShowDepartmentModal(true);
  };

  const filteredEmployees = employees.filter(emp =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Shield className="h-8 w-8 mr-3 text-pink-600" />
          Панель Администратора
        </h1>
        <p className="text-gray-600 mt-2">
          Управление пользователями, отделами и почтовыми ящиками
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'users'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-5 w-5 inline-block mr-2" />
              Пользователи
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'departments'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="h-5 w-5 inline-block mr-2" />
              Отделы
            </button>
            <button
              onClick={() => setActiveTab('mailboxes')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'mailboxes'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Mail className="h-5 w-5 inline-block mr-2" />
              Почтовые ящики
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={loadData}
              variant="secondary"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
            {activeTab === 'users' && (
              <Button
                onClick={() => {
                  resetUserForm();
                  setShowUserModal(true);
                }}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Добавить пользователя
              </Button>
            )}
            {activeTab === 'departments' && (
              <Button
                onClick={() => {
                  setEditingDepartment(null);
                  resetDepartmentForm();
                  setShowDepartmentModal(true);
                }}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить отдел
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Отдел
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Должность
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Нет пользователей
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => {
                    const dept = departments.find(d => d.id === emp.department_id);
                    return (
                      <tr key={emp.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {emp.first_name} {emp.last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{emp.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{dept?.name || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{emp.position || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            onClick={() => {
                              setSelectedUserForMailbox({ id: emp.user_id || 0, email: emp.email } as User);
                              setShowMailboxModal(true);
                            }}
                            variant="secondary"
                            className="mr-2"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Описание
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сотрудников
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Нет отделов
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((dept) => {
                    const empCount = employees.filter(e => e.department_id === dept.id).length;
                    return (
                      <tr key={dept.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{dept.description || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{empCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            onClick={() => openEditDepartment(dept)}
                            variant="secondary"
                            className="mr-2"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteDepartment(dept.id)}
                            variant="secondary"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'mailboxes' && (
          <div className="p-6">
            <div className="text-center text-gray-500">
              <Mail className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-4">Управление почтовыми ящиками</p>
              <p className="text-sm">
                Для создания почтового ящика перейдите на вкладку "Пользователи" и нажмите на иконку почты рядом с нужным пользователем
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Создать пользователя</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Имя *"
                value={userForm.first_name}
                onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
              />
              <Input
                type="text"
                placeholder="Фамилия *"
                value={userForm.last_name}
                onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
              />
            </div>
            
            <Input
              type="email"
              placeholder="Email *"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            />
            
            <Input
              type="text"
              placeholder="Имя пользователя (опционально)"
              value={userForm.username}
              onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
            />
            
            <Input
              type="password"
              placeholder="Пароль *"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            />
            
            <Input
              type="text"
              placeholder="Должность"
              value={userForm.position}
              onChange={(e) => setUserForm({ ...userForm, position: e.target.value })}
            />
            
            <select
              value={userForm.department_id}
              onChange={(e) => setUserForm({ ...userForm, department_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Выберите отдел</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            
            <select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="EMPLOYEE">Сотрудник</option>
              <option value="MANAGER">Менеджер</option>
              <option value="ADMIN">Администратор</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => setShowUserModal(false)}
              variant="secondary"
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreateUser}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Создать
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create/Edit Department Modal */}
      <Modal isOpen={showDepartmentModal} onClose={() => setShowDepartmentModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingDepartment ? 'Редактировать отдел' : 'Создать отдел'}
          </h2>
          
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Название отдела *"
              value={departmentForm.name}
              onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
            />
            
            <textarea
              placeholder="Описание"
              value={departmentForm.description}
              onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            
            <select
              value={departmentForm.parent_id}
              onChange={(e) => setDepartmentForm({ ...departmentForm, parent_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Родительский отдел (опционально)</option>
              {departments
                .filter(d => !editingDepartment || d.id !== editingDepartment.id)
                .map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => {
                setShowDepartmentModal(false);
                setEditingDepartment(null);
              }}
              variant="secondary"
            >
              Отмена
            </Button>
            <Button
              onClick={editingDepartment ? handleUpdateDepartment : handleCreateDepartment}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {editingDepartment ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Mailbox Modal */}
      <Modal isOpen={showMailboxModal} onClose={() => setShowMailboxModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Создать почтовый ящик</h2>
          
          {selectedUserForMailbox && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Пользователь:</p>
              <p className="text-lg font-medium text-gray-900">{selectedUserForMailbox.email}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Пароль для почтового ящика *"
              value={mailboxPassword}
              onChange={(e) => setMailboxPassword(e.target.value)}
            />
            
            <p className="text-sm text-gray-500">
              Этот пароль будет использоваться для доступа к почтовому ящику через IMAP/SMTP
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => setShowMailboxModal(false)}
              variant="secondary"
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreateMailbox}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Mail className="h-4 w-4 mr-2" />
              Создать
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

