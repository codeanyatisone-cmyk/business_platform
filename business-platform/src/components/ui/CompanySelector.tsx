import React, { useState, useEffect } from 'react';
import { ChevronDown, Building2, Users } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Company } from '../../types';

interface CompanySelectorProps {
  className?: string;
}

export function CompanySelector({ className = '' }: CompanySelectorProps) {
  const { state, dispatch } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const currentCompany = companies.find(c => c.id === state.currentCompanyId);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        // В реальном приложении здесь будет загрузка с сервера
        // const companiesData = await API.companies.getAll();
        
        // Для демо используем моковые данные
        const mockCompanies: Company[] = [
          {
            id: 1,
            name: 'TKO Company',
            description: 'Основная компания',
            logo: 'https://ui-avatars.com/api/?name=TKO+Company&background=3B82F6&color=ffffff',
            industry: 'IT',
            website: 'https://tko.com',
            email: 'info@tko.com',
            phone: '+7 (777) 123-45-67',
            address: 'Алматы, Казахстан',
            taxId: '123456789012',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            _count: {
              employees: 25,
              departments: 5,
              tasks: 150,
            },
          },
          {
            id: 2,
            name: 'Тестовая Компания',
            description: 'Тестовая компания для разработки',
            logo: 'https://ui-avatars.com/api/?name=Test+Company&background=10B981&color=ffffff',
            industry: 'Консалтинг',
            website: 'https://test.com',
            email: 'test@test.com',
            phone: '+7 (777) 987-65-43',
            address: 'Астана, Казахстан',
            taxId: '987654321098',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            _count: {
              employees: 12,
              departments: 3,
              tasks: 45,
            },
          },
        ];
        
        setCompanies(mockCompanies);
        dispatch({ type: 'SET_COMPANIES', payload: mockCompanies });
      } catch (error) {
        console.error('Failed to load companies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, [dispatch]);

  const handleCompanyChange = (companyId: number) => {
    dispatch({ type: 'SET_CURRENT_COMPANY', payload: companyId });
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Building2 className="h-5 w-5 text-gray-400" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {currentCompany?.logo ? (
          <img
            src={currentCompany.logo}
            alt={currentCompany.name}
            className="h-5 w-5 rounded-full"
          />
        ) : (
          <Building2 className="h-5 w-5 text-gray-500" />
        )}
        <span className="text-sm font-medium text-gray-900 truncate max-w-32">
          {currentCompany?.name || 'Выберите компанию'}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Компании
              </div>
              
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleCompanyChange(company.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors ${
                    company.id === state.currentCompanyId ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {company.name}
                    </div>
                    {company.description && (
                      <div className="text-xs text-gray-500 truncate">
                        {company.description}
                      </div>
                    )}
                    
                    {company._count && (
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {company._count.employees} сотрудников
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">•</div>
                        <span className="text-xs text-gray-500">
                          {company._count.departments} отделов
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {company.id === state.currentCompanyId && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}




