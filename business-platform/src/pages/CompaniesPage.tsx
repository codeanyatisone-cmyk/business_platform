import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Building2, Users, FolderOpen, CheckCircle, XCircle, Eye, Save, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useNotification } from '../hooks/useNotification';
import { Company } from '../types';
import { companiesAPI } from '../services/api/companies.api';

export function CompaniesPage() {
  const { showNotification } = useNotification();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companiesAPI.getAll();
      setCompanies(data);
    } catch (error) {
      showNotification({
        message: 'Ошибка загрузки компаний',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async () => {
    if (!formData.name.trim()) {
      showNotification({
        message: 'Название компании обязательно',
        type: 'error',
      });
      return;
    }

    try {
      await companiesAPI.create(formData);
      showNotification({
        message: 'Компания создана успешно',
        type: 'success',
      });
      setIsCreateModalOpen(false);
      resetForm();
      loadCompanies();
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Ошибка создания компании',
        type: 'error',
      });
    }
  };

  const handleUpdateCompany = async () => {
    if (!selectedCompany || !formData.name.trim()) {
      showNotification({
        message: 'Название компании обязательно',
        type: 'error',
      });
      return;
    }

    try {
      await companiesAPI.update(selectedCompany.id, formData);
      showNotification({
        message: 'Компания обновлена успешно',
        type: 'success',
      });
      setIsEditModalOpen(false);
      resetForm();
      loadCompanies();
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Ошибка обновления компании',
        type: 'error',
      });
    }
  };

  const handleDeleteCompany = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту компанию? Это действие нельзя отменить.')) {
      return;
    }

    try {
      await companiesAPI.delete(id);
      showNotification({
        message: 'Компания удалена',
        type: 'success',
      });
      loadCompanies();
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Ошибка удаления компании',
        type: 'error',
      });
    }
  };

  const handleToggleStatus = async (company: Company) => {
    try {
      if (company.isActive) {
        await companiesAPI.deactivate(company.id);
        showNotification({
          message: 'Компания деактивирована',
          type: 'success',
        });
      } else {
        await companiesAPI.activate(company.id);
        showNotification({
          message: 'Компания активирована',
          type: 'success',
        });
      }
      loadCompanies();
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Ошибка изменения статуса',
        type: 'error',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      industry: '',
      website: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
    });
    setSelectedCompany(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      description: company.description || '',
      industry: company.industry || '',
      website: company.website || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
      taxId: company.taxId || '',
    });
    setIsEditModalOpen(true);
  };

  const openDetailsModal = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailsModalOpen(true);
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Активна
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Неактивна
      </span>
    );
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Building2 className="h-8 w-8 mr-3 text-blue-600" />
                Управление компаниями
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Создание, редактирование и управление компаниями
              </p>
            </div>
            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={openCreateModal}
            >
              Добавить компанию
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию, отрасли или email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Всего компаний</div>
            <div className="text-3xl font-bold text-gray-900">{companies.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Активные</div>
            <div className="text-3xl font-bold text-green-600">
              {companies.filter(c => c.isActive).length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Сотрудников</div>
            <div className="text-3xl font-bold text-blue-600">
              {companies.reduce((sum, c) => sum + (c._count?.employees || 0), 0)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Отделов</div>
            <div className="text-3xl font-bold text-purple-600">
              {companies.reduce((sum, c) => sum + (c._count?.departments || 0), 0)}
            </div>
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Компания
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Отрасль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Контакты
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
                ) : filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Компании не найдены
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{company.name}</div>
                          {company.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {company.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{company.industry || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {company.email && (
                            <div className="truncate max-w-xs">{company.email}</div>
                          )}
                          {company.phone && (
                            <div className="text-gray-500">{company.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {company._count?.employees || 0}
                          </div>
                          <div className="flex items-center">
                            <FolderOpen className="h-4 w-4 mr-1" />
                            {company._count?.departments || 0}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(company.isActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDetailsModal(company)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Просмотр"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(company)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Редактировать"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(company)}
                            className={company.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}
                            title={company.isActive ? 'Деактивировать' : 'Активировать'}
                          >
                            {company.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteCompany(company.id)}
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

        {/* Create Company Modal */}
        {isCreateModalOpen && (
          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Создать компанию"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название компании *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Введите название компании"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Описание деятельности компании"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Отрасль
                </label>
                <Input
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="IT, Финансы, Производство..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сайт
                </label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+7 (xxx) xxx-xx-xx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Адрес
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Город, улица, дом"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ИНН/БИН
                </label>
                <Input
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="12 цифр"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateCompany} icon={<Save className="h-4 w-4" />}>
                  Создать
                </Button>
                <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Edit Company Modal */}
        {isEditModalOpen && selectedCompany && (
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title="Редактировать компанию"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название компании *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Введите название компании"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Описание деятельности компании"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Отрасль
                </label>
                <Input
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="IT, Финансы, Производство..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сайт
                </label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+7 (xxx) xxx-xx-xx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Адрес
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Город, улица, дом"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ИНН/БИН
                </label>
                <Input
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="12 цифр"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleUpdateCompany} icon={<Save className="h-4 w-4" />}>
                  Сохранить
                </Button>
                <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Company Details Modal */}
        {isDetailsModalOpen && selectedCompany && (
          <Modal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            title={`Информация о компании: ${selectedCompany.name}`}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название
                  </label>
                  <div className="text-sm text-gray-900">{selectedCompany.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Статус
                  </label>
                  {getStatusBadge(selectedCompany.isActive)}
                </div>
              </div>
              
              {selectedCompany.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <div className="text-sm text-gray-900">{selectedCompany.description}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedCompany.industry && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Отрасль
                    </label>
                    <div className="text-sm text-gray-900">{selectedCompany.industry}</div>
                  </div>
                )}
                {selectedCompany.taxId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ИНН/БИН
                    </label>
                    <div className="text-sm text-gray-900">{selectedCompany.taxId}</div>
                  </div>
                )}
              </div>

              {(selectedCompany.email || selectedCompany.phone || selectedCompany.website) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Контакты
                  </label>
                  <div className="space-y-2">
                    {selectedCompany.email && (
                      <div className="text-sm text-gray-900">Email: {selectedCompany.email}</div>
                    )}
                    {selectedCompany.phone && (
                      <div className="text-sm text-gray-900">Телефон: {selectedCompany.phone}</div>
                    )}
                    {selectedCompany.website && (
                      <div className="text-sm text-gray-900">
                        Сайт: <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {selectedCompany.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedCompany.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Адрес
                  </label>
                  <div className="text-sm text-gray-900">{selectedCompany.address}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Сотрудников
                  </label>
                  <div className="text-sm text-gray-900">{selectedCompany._count?.employees || 0}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Отделов
                  </label>
                  <div className="text-sm text-gray-900">{selectedCompany._count?.departments || 0}</div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={() => setIsDetailsModalOpen(false)}>
                  Закрыть
                </Button>
                <Button onClick={() => {
                  setIsDetailsModalOpen(false);
                  openEditModal(selectedCompany);
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
