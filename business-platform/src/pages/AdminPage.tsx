import React, { useState, useEffect } from 'react';
import { Shield, Search, Edit2, Trash2, UserPlus, DollarSign, Save, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { api } from '../services/api/axios.config';

interface EmployeeData {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  phone?: string;
  avatar: string;
  birthDate: string;
  hireDate: string;
  status: string;
  salary?: number;
  user?: {
    id: number;
    role: string;
  };
}

export function AdminPage() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    position: '',
    department: '',
    phone: '',
  });

  const [salaryAmount, setSalaryAmount] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');

  // useEffect должен быть вызван до любого условного return
  useEffect(() => {
    // Загружаем данные только если есть права доступа
    if (user?.role === 'admin' || user?.role === 'owner') {
      loadEmployees();
    }
  }, [user?.role]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      showNotification({
        message: 'Ошибка загрузки сотрудников',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      await api.put(`/employees/${selectedEmployee.id}`, editForm);
      
      showNotification({
        message: 'Данные сотрудника обновлены!',
        type: 'success',
      });
      
      setEditModalOpen(false);
      loadEmployees();
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Ошибка обновления',
        type: 'error',
      });
    }
  };

  const handleUpdateSalary = async () => {
    if (!selectedEmployee) return;

    try {
      await api.put(`/employees/${selectedEmployee.id}`, {
        salary: parseFloat(salaryAmount),
      });
      
      showNotification({
        message: 'Зарплата обновлена!',
        type: 'success',
      });
      
      setSalaryModalOpen(false);
      loadEmployees();
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Ошибка обновления зарплаты',
        type: 'error',
      });
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedEmployee?.user) return;

    try {
      await api.put(`/auth/update-role/${selectedEmployee.user.id}`, {
        role: selectedRole,
      });
      
      showNotification({
        message: 'Роль обновлена!',
        type: 'success',
      });
      
      setRoleModalOpen(false);
      loadEmployees();
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Ошибка обновления роли',
        type: 'error',
      });
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!window.confirm('Вы уверены? Это действие нельзя отменить.')) return;

    try {
      await api.delete(`/employees/${id}`);
      
      showNotification({
        message: 'Сотрудник удален',
        type: 'success',
      });
      
      loadEmployees();
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Ошибка удаления',
        type: 'error',
      });
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    
    const styles = {
      owner: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      owner: '👑 Владелец',
      admin: '🛡️ Админ',
      manager: '⭐ Менеджер',
      user: '👤 Пользователь',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[role as keyof typeof styles] || styles.user}`}>
        {labels[role as keyof typeof labels] || role}
      </span>
    );
  };

  // Проверка прав доступа (после всех хуков)
  if (user?.role !== 'admin' && user?.role !== 'owner') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Доступ запрещен</h2>
          <p className="text-gray-600">У вас нет прав для доступа к этой странице</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="h-8 w-8 mr-3 text-purple-600" />
                Админ-панель
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Управление сотрудниками, ролями и доступами
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по имени, email или должности..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Всего сотрудников</div>
            <div className="text-3xl font-bold text-gray-900">{employees.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Администраторы</div>
            <div className="text-3xl font-bold text-purple-600">
              {employees.filter(e => e.user?.role === 'admin' || e.user?.role === 'owner').length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Менеджеры</div>
            <div className="text-3xl font-bold text-blue-600">
              {employees.filter(e => e.user?.role === 'manager').length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Активные</div>
            <div className="text-3xl font-bold text-green-600">
              {employees.filter(e => e.status === 'active').length}
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сотрудник
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Должность / Отдел
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Зарплата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Загрузка...
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Сотрудники не найдены
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={employee.avatar}
                            alt={employee.name}
                            className="h-10 w-10 rounded-full"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{employee.position}</div>
                        <div className="text-sm text-gray-500">{employee.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(employee.user?.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {employee.salary 
                            ? `${employee.salary.toLocaleString('ru-RU')} ₸`
                            : <span className="text-gray-400">Не указана</span>
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          employee.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {employee.status === 'active' ? 'Активен' : 'Неактивен'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setEditForm({
                                name: employee.name,
                                position: employee.position,
                                department: employee.department,
                                phone: employee.phone || '',
                              });
                              setEditModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Редактировать"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {employee.user && (
                            <button
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setSelectedRole(employee.user?.role || 'user');
                                setRoleModalOpen(true);
                              }}
                              className="text-purple-600 hover:text-purple-900"
                              title="Изменить роль"
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setSalaryAmount(employee.salary?.toString() || '');
                              setSalaryModalOpen(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Установить зарплату"
                          >
                            <DollarSign className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {editModalOpen && selectedEmployee && (
          <Modal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            title="Редактировать сотрудника"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Должность</label>
                <Input
                  value={editForm.position}
                  onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Отдел</label>
                <Input
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleEditEmployee} icon={<Save className="h-4 w-4" />}>
                  Сохранить
                </Button>
                <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Salary Modal */}
        {salaryModalOpen && selectedEmployee && (
          <Modal
            isOpen={salaryModalOpen}
            onClose={() => setSalaryModalOpen(false)}
            title="Установить зарплату"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Зарплата для {selectedEmployee.name}
                </label>
                <Input
                  type="number"
                  value={salaryAmount}
                  onChange={(e) => setSalaryAmount(e.target.value)}
                  placeholder="0"
                />
                <p className="mt-1 text-sm text-gray-500">в тенге (₸)</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleUpdateSalary} icon={<DollarSign className="h-4 w-4" />}>
                  Сохранить
                </Button>
                <Button variant="secondary" onClick={() => setSalaryModalOpen(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Role Modal */}
        {roleModalOpen && selectedEmployee && (
          <Modal
            isOpen={roleModalOpen}
            onClose={() => setRoleModalOpen(false)}
            title="Изменить роль"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Роль для {selectedEmployee.name}
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                >
                  <option value="user">👤 Пользователь</option>
                  <option value="manager">⭐ Менеджер</option>
                  <option value="admin">🛡️ Администратор</option>
                  <option value="owner">👑 Владелец</option>
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  <strong>Права доступа:</strong>
                  <br />
                  • <strong>Пользователь:</strong> базовый доступ
                  <br />
                  • <strong>Менеджер:</strong> управление задачами
                  <br />
                  • <strong>Администратор:</strong> полный доступ к управлению
                  <br />
                  • <strong>Владелец:</strong> максимальные права
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleUpdateRole} icon={<Shield className="h-4 w-4" />}>
                  Сохранить
                </Button>
                <Button variant="secondary" onClick={() => setRoleModalOpen(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

