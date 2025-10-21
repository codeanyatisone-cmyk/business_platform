import { useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { API } from '../services/api';
// import { USE_MOCK_DATA } from '../services/api/axios.config';
import { Transaction, Employee, Company } from '../types';

const USE_MOCK_DATA = false; // Всегда используем API

/**
 * Основной хук для работы с API
 */
export function useAPI() {
  const { state, dispatch } = useApp();

  const loadData = useCallback(async () => {
    try {
      // Загрузка сотрудников
      const employees = await API.employees.getAll();
      dispatch({ type: 'SET_EMPLOYEES', payload: employees });

      // Загрузка компаний
      const companies = await API.companies.getAll();
      dispatch({ type: 'SET_COMPANIES', payload: companies });

      // Загрузка транзакций
      const transactions = await API.transactions.getAll();
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });

    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  }, [dispatch]);

  return {
    loadData,
  };
}

/**
 * Хук для работы с транзакциями через API
 */
export function useTransactionsAPI() {
  const { dispatch } = useApp();

  const createTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'createdBy'>) => {
    if (USE_MOCK_DATA) {
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        createdBy: 'Mock User',
        createdById: 1,
      };
      dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
      return newTransaction;
    }

    const newTransaction = await API.transactions.create(transaction);
    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
    return newTransaction;
  };

  const updateTransaction = async (id: number, updates: Partial<Transaction>) => {
    if (USE_MOCK_DATA) {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: { ...updates, id } as Transaction });
      return;
    }

    const updatedTransaction = await API.transactions.update(id, updates);
    dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
  };

  const deleteTransaction = async (id: number) => {
    if (USE_MOCK_DATA) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      return;
    }

    await API.transactions.delete(id);
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  return {
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}

/**
 * Хук для работы с сотрудниками через API
 */
export function useEmployeesAPI() {
  const { dispatch } = useApp();

  const createEmployee = async (employee: Omit<Employee, 'id'>) => {
    if (USE_MOCK_DATA) {
      const newEmployee: Employee = {
        ...employee,
        id: Date.now(),
      };
      dispatch({ type: 'ADD_EMPLOYEE', payload: newEmployee });
      return newEmployee;
    }

    const newEmployee = await API.employees.create(employee);
    dispatch({ type: 'ADD_EMPLOYEE', payload: newEmployee });
    return newEmployee;
  };

  const updateEmployee = async (id: number, updates: Partial<Employee>) => {
    if (USE_MOCK_DATA) {
      dispatch({ type: 'UPDATE_EMPLOYEE', payload: { ...updates, id } as Employee });
      return;
    }

    const updatedEmployee = await API.employees.update(id, updates);
    dispatch({ type: 'UPDATE_EMPLOYEE', payload: updatedEmployee });
  };

  const deleteEmployee = async (id: number) => {
    if (USE_MOCK_DATA) {
      dispatch({ type: 'DELETE_EMPLOYEE', payload: id });
      return;
    }

    await API.employees.delete(id);
    dispatch({ type: 'DELETE_EMPLOYEE', payload: id });
  };

  return {
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}

/**
 * Хук для работы с компаниями через API
 */
export function useCompaniesAPI() {
  const getCompanies = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/companies');
      if (!response.ok) throw new Error('Failed to fetch companies');
      return await response.json();
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  }, []);

  const createCompany = async (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
      });
      if (!response.ok) throw new Error('Failed to create company');
      return await response.json();
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  };

  const updateCompany = async (id: number, updates: Partial<Company>) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/companies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update company');
      return await response.json();
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  };

  const deleteCompany = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/companies/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete company');
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  };

  return {
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
  };
}

