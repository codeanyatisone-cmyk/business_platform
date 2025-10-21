import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, FolderOpen, Users, UserCheck, ChevronRight, ChevronDown, Save, X, Building2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useNotification } from '../hooks/useNotification';
import { Department, Company, Employee } from '../types';
import { departmentsAPI } from '../services/api/departments.api';
import { companiesAPI } from '../services/api/companies.api';

interface DepartmentWithChildren extends Department {
  children?: DepartmentWithChildren[];
  expanded?: boolean;
}

export function DepartmentsPage() {
  const { showNotification } = useNotification();
  const [departments, setDepartments] = useState<DepartmentWithChildren[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentWithChildren | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    companyId: 1,
    managerId: undefined as number | undefined,
    parentId: undefined as number | undefined,
  });

  useEffect(() => {
    loadCompanies();
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadDepartments(parseInt(selectedCompany));
    }
  }, [selectedCompany]);

  const loadCompanies = async () => {
    try {
      const data = await companiesAPI.getAll();
      setCompanies(data);
    } catch (error) {
      showNotification({
        message: 'Ошибка загрузки компаний',
        type: 'error',
      });
    }
  };

  const loadDepartments = async (companyId?: number) => {
    try {
      setLoading(true);
      const data = await departmentsAPI.getAll(companyId);
      // Build hierarchy
      const hierarchy = buildHierarchy(data);
      setDepartments(hierarchy);
    } catch (error) {
      showNotification({
        message: 'Ошибка загрузки отделов',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchy = (depts: Department[]): DepartmentWithChildren[] => {
    const deptMap = new Map<number, DepartmentWithChildren>();
    const roots: DepartmentWithChildren[] = [];

    // Create map of all departments
    depts.forEach(dept => {
      deptMap.set(dept.id, { ...dept, children: [], expanded: false });
    });

    // Build hierarchy
    depts.forEach(dept => {
      const deptWithChildren = deptMap.get(dept.id)!;
      if (dept.parentId && deptMap.has(dept.parentId)) {
        deptMap.get(dept.parentId)!.children!.push(deptWithChildren);
      } else {
        roots.push(deptWithChildren);
      }
    });

    return roots;
  };

  const toggleExpand = (id: number) => {
    const toggleRecursive = (depts: DepartmentWithChildren[]): DepartmentWithChildren[] => {
      return depts.map(dept => {
        if (dept.id === id) {
          return { ...dept, expanded: !dept.expanded };
        }
        if (dept.children && dept.children.length > 0) {
          return { ...dept, children: toggleRecursive(dept.children) };
        }
        return dept;
      });
    };
    setDepartments(toggleRecursive(departments));
  };

  const handleCreateDepartment = async () => {
    if (!formData.name.trim()) {
      showNotification({
        message: 'Название отдела обязательно',
        type: 'error',
      });
      return;
    }

    try {
      await departmentsAPI.create(formData);
      showNotification({
        message: 'Отдел создан успешно',
        type: 'success',
      });
      setIsCreateModalOpen(false);
      resetForm();
      loadDepartments(parseInt(selectedCompany) || undefined);
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Ошибка создания отдела',
        type: 'error',
      });
    }
  };

  const handleUpdateDepartment = async () => {
    if (!selectedDepartment || !formData.name.trim()) {
      showNotification({
        message: 'Название отдела обязательно',
        type: 'error',
      });
      return;
    }

    try {
      await departmentsAPI.update(selectedDepartment.id, formData);
      showNotification({
        message: 'Отдел обновлен успешно',
        type: 'success',
      });
      setIsEditModalOpen(false);
      resetForm();
      loadDepartments(parseInt(selectedCompany) || undefined);
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Ошибка обновления отдела',
        type: 'error',
      });
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот отдел? Это действие нельзя отменить.')) {
      return;
    }

    try {
      await departmentsAPI.delete(id);
      showNotification({
        message: 'Отдел удален',
        type: 'success',
      });
      loadDepartments(parseInt(selectedCompany) || undefined);
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Ошибка удаления отдела',
        type: 'error',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      companyId: 1,
      managerId: undefined,
      parentId: undefined,
    });
    setSelectedDepartment(null);
  };

  const openCreateModal = () => {
    resetForm();
    setFormData(prev => ({ ...prev, companyId: parseInt(selectedCompany) || 1 }));
    setIsCreateModalOpen(true);
  };

  const openEditModal = (department: DepartmentWithChildren) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      companyId: department.companyId,
      managerId: department.managerId,
      parentId: department.parentId,
    });
    setIsEditModalOpen(true);
  };

  const openDetailsModal = (department: DepartmentWithChildren) => {
    setSelectedDepartment(department);
    setIsDetailsModalOpen(true);
  };

  const getAllDepartments = (depts: DepartmentWithChildren[]): DepartmentWithChildren[] => {
    let result: DepartmentWithChildren[] = [];
    depts.forEach(dept => {
      result.push(dept);
      if (dept.children && dept.children.length > 0) {
        result = result.concat(getAllDepartments(dept.children));
      }
    });
    return result;
  };

  const filteredDepartments = (() => {
    if (!searchTerm) return departments;
    
    const allDepts = getAllDepartments(departments);
    const filtered = allDepts.filter(dept =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.manager?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Rebuild hierarchy with filtered departments
    return buildHierarchy(filtered);
  })();

  const renderDepartmentTree = (depts: DepartmentWithChildren[], level = 0) => {
    return depts.map((dept) => (
      <React.Fragment key={dept.id}>
        <tr className="hover:bg-gray-50">
          <td className="px-6 py-4" style={{ paddingLeft: `${20 + level * 20}px` }}>
            <div className="flex items-center">
              {dept.children && dept.children.length > 0 && (
                <button
                  onClick={() => toggleExpand(dept.id)}
                  className="mr-2 text-gray-400 hover:text-gray-600"
                >
                  {dept.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              )}
              <div className="flex items-center">
                <FolderOpen className="h-4 w-4 text-blue-500 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                  {dept.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {dept.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="text-sm text-gray-900">{dept.company?.name || '-'}</div>
          </td>
          <td className="px-6 py-4">
            {dept.manager ? (
              <div className="flex items-center">
                <img
                  src={dept.manager.avatar}
                  alt={dept.manager.name}
                  className="h-6 w-6 rounded-full mr-2"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">{dept.manager.name}</div>
                  <div className="text-sm text-gray-500">{dept.manager.position}</div>
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray-500">Не назначен</span>
            )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {dept._count?.employees || 0}
              </div>
              <div className="flex items-center">
                <FolderOpen className="h-4 w-4 mr-1" />
                {dept._count?.children || 0}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              dept.isActive 
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {dept.isActive ? 'Активен' : 'Неактивен'}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => openDetailsModal(dept)}
                className="text-blue-600 hover:text-blue-900"
                title="Просмотр"
              >
                <Users className="h-4 w-4" />
              </button>
              <button
                onClick={() => openEditModal(dept)}
                className="text-blue-600 hover:text-blue-900"
                title="Редактировать"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteDepartment(dept.id)}
                className="text-red-600 hover:text-red-900"
                title="Удалить"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
        {dept.expanded && dept.children && dept.children.length > 0 && 
          renderDepartmentTree(dept.children, level + 1)
        }
      </React.Fragment>
    ));
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FolderOpen className="h-8 w-8 mr-3 text-green-600" />
                Управление отделами
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Создание, редактирование и управление отделами
              </p>
            </div>
            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={openCreateModal}
            >
              Добавить отдел
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по названию, описанию или руководителю..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-64">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Все компании</option>
              {companies.map(company => (
                <option key={company.id} value={company.id.toString()}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Всего отделов</div>
            <div className="text-3xl font-bold text-gray-900">
              {getAllDepartments(departments).length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Активные</div>
            <div className="text-3xl font-bold text-green-600">
              {getAllDepartments(departments).filter(d => d.isActive).length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">С руководителями</div>
            <div className="text-3xl font-bold text-blue-600">
              {getAllDepartments(departments).filter(d => d.managerId).length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Сотрудников</div>
            <div className="text-3xl font-bold text-purple-600">
              {getAllDepartments(departments).reduce((sum, d) => sum + (d._count?.employees || 0), 0)}
            </div>
          </div>
        </div>

        {/* Departments Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Отдел
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Компания
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Руководитель
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статистика
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
                ) : filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Отделы не найдены
                    </td>
                  </tr>
                ) : (
                  renderDepartmentTree(filteredDepartments)
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Department Modal */}
        {isCreateModalOpen && (
          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Создать отдел"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название отдела *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Введите название отдела"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Описание отдела"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Компания
                </label>
                <select
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Родительский отдел
                </label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Корневой отдел</option>
                  {getAllDepartments(departments).map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateDepartment} icon={<Save className="h-4 w-4" />}>
                  Создать
                </Button>
                <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Edit Department Modal */}
        {isEditModalOpen && selectedDepartment && (
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title="Редактировать отдел"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название отдела *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Введите название отдела"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Описание отдела"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Компания
                </label>
                <select
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Родительский отдел
                </label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Корневой отдел</option>
                  {getAllDepartments(departments).filter(d => d.id !== selectedDepartment.id).map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleUpdateDepartment} icon={<Save className="h-4 w-4" />}>
                  Сохранить
                </Button>
                <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Department Details Modal */}
        {isDetailsModalOpen && selectedDepartment && (
          <Modal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            title={`Информация об отделе: ${selectedDepartment.name}`}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название
                  </label>
                  <div className="text-sm text-gray-900">{selectedDepartment.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Статус
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedDepartment.isActive 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedDepartment.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
              </div>
              
              {selectedDepartment.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <div className="text-sm text-gray-900">{selectedDepartment.description}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Компания
                  </label>
                  <div className="text-sm text-gray-900">{selectedDepartment.company?.name || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Сотрудников
                  </label>
                  <div className="text-sm text-gray-900">{selectedDepartment._count?.employees || 0}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Руководитель
                </label>
                {selectedDepartment.manager ? (
                  <div className="flex items-center">
                    <img
                      src={selectedDepartment.manager.avatar}
                      alt={selectedDepartment.manager.name}
                      className="h-8 w-8 rounded-full mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{selectedDepartment.manager.name}</div>
                      <div className="text-sm text-gray-500">{selectedDepartment.manager.position}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Не назначен</div>
                )}
              </div>

              {selectedDepartment.children && selectedDepartment.children.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Подотделы ({selectedDepartment.children.length})
                  </label>
                  <div className="space-y-2">
                    {selectedDepartment.children.map(child => (
                      <div key={child.id} className="flex items-center p-2 bg-gray-50 rounded">
                        <FolderOpen className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-900">{child.name}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          {child._count?.employees || 0} сотрудников
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={() => setIsDetailsModalOpen(false)}>
                  Закрыть
                </Button>
                <Button onClick={() => {
                  setIsDetailsModalOpen(false);
                  openEditModal(selectedDepartment);
                }}>
                  Редактировать
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
