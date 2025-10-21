import React, { useState, useMemo, ChangeEvent } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNotification } from '../hooks/useNotification';
import { Transaction, Currency, TransactionType, TransactionCategory, Account } from '../types';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const FinancesPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const { showNotification } = useNotification();

  // Состояния
  const [activeTab, setActiveTab] = useState<'summary' | 'income' | 'expense'>('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    period: 'month', // month, quarter, year
    currency: '' as Currency | '',
    type: '' as TransactionType | '',
    category: '' as TransactionCategory | '',
    startDate: '',
    endDate: '',
  });

  // Модальные окна
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Форма транзакции
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: 'income',
    category: 'Доходы от услуг',
    amount: 0,
    currency: 'KZT',
    description: '',
    date: new Date().toISOString().split('T')[0],
    account: '',
    counterparty: '',
    project: '',
    tags: [],
  });

  // Форма счета
  const [newAccount, setNewAccount] = useState<Partial<Account>>({
    name: '',
    currency: 'KZT',
    balance: 0,
    type: 'bank',
    description: '',
  });

  // Фильтрация транзакций
  const filteredTransactions = useMemo(() => {
    let filtered = state.transactions;

    // Поиск
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.counterparty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.project?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по типу (для вкладок)
    if (activeTab === 'income') {
      filtered = filtered.filter(t => t.type === 'income');
    } else if (activeTab === 'expense') {
      filtered = filtered.filter(t => t.type === 'expense');
    }

    // Фильтры
    if (filters.currency) {
      filtered = filtered.filter(t => t.currency === filters.currency);
    }
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }
    if (filters.startDate) {
      filtered = filtered.filter(t => t.date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(t => t.date <= filters.endDate);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.transactions, searchQuery, activeTab, filters]);

  // Вычисление статистики
  const statistics = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const calculateStats = (transactions: Transaction[], currency: Currency = 'KZT') => {
      const filtered = transactions.filter(t => t.currency === currency);
      const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      return { income, expense, profit: income - expense };
    };

    const monthTransactions = state.transactions.filter(t => new Date(t.date) >= startOfMonth);
    const yearTransactions = state.transactions.filter(t => new Date(t.date) >= startOfYear);

    return {
      month: {
        KZT: calculateStats(monthTransactions, 'KZT'),
        USD: calculateStats(monthTransactions, 'USD'),
        RUB: calculateStats(monthTransactions, 'RUB'),
        EUR: calculateStats(monthTransactions, 'EUR'),
      },
      year: {
        KZT: calculateStats(yearTransactions, 'KZT'),
        USD: calculateStats(yearTransactions, 'USD'),
        RUB: calculateStats(yearTransactions, 'RUB'),
        EUR: calculateStats(yearTransactions, 'EUR'),
      },
      all: {
        KZT: calculateStats(state.transactions, 'KZT'),
        USD: calculateStats(state.transactions, 'USD'),
        RUB: calculateStats(state.transactions, 'RUB'),
        EUR: calculateStats(state.transactions, 'EUR'),
      },
    };
  }, [state.transactions]);

  // Структура расходов по категориям
  const expenseStructure = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    const byCategory: Record<string, number> = {};
    
    expenses.forEach(t => {
      if (!byCategory[t.category]) {
        byCategory[t.category] = 0;
      }
      byCategory[t.category] += t.amount;
    });

    const total = Object.values(byCategory).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(byCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total * 100).toFixed(1) : '0',
    })).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Обработчики транзакций
  const handleCreateTransaction = () => {
    setEditingTransaction(null);
    setNewTransaction({
      type: 'income',
      category: 'Доходы от услуг',
      amount: 0,
      currency: 'KZT',
      description: '',
      date: new Date().toISOString().split('T')[0],
      account: '',
      counterparty: '',
      project: '',
      tags: [],
    });
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setNewTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleSaveTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount) {
      showNotification({ message: 'Заполните все обязательные поля', type: 'error' });
      return;
    }

    if (editingTransaction) {
      dispatch({
        type: 'UPDATE_TRANSACTION',
        payload: {
          ...editingTransaction,
          ...newTransaction,
          updatedAt: new Date().toISOString(),
        } as Transaction,
      });
      showNotification({ message: 'Транзакция обновлена', type: 'success' });
    } else {
      const transaction: Transaction = {
        id: Date.now(),
        type: newTransaction.type as TransactionType,
        category: newTransaction.category as TransactionCategory,
        amount: newTransaction.amount!,
        currency: newTransaction.currency as Currency,
        description: newTransaction.description!,
        date: newTransaction.date!,
        account: newTransaction.account!,
        counterparty: newTransaction.counterparty,
        project: newTransaction.project,
        createdBy: 'Текущий пользователь',
        createdById: 1,
        createdAt: new Date().toISOString(),
        tags: newTransaction.tags || [],
      };
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
      showNotification({ message: 'Транзакция добавлена', type: 'success' });
    }

    setIsTransactionModalOpen(false);
  };

  const handleDeleteTransaction = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      showNotification({ message: 'Транзакция удалена', type: 'success' });
    }
  };

  // Обработчики счетов
  const handleCreateAccount = () => {
    setEditingAccount(null);
    setNewAccount({
      name: '',
      currency: 'KZT',
      balance: 0,
      type: 'bank',
      description: '',
    });
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = () => {
    if (!newAccount.name) {
      showNotification({ message: 'Введите название счета', type: 'error' });
      return;
    }

    if (editingAccount) {
      dispatch({
        type: 'UPDATE_ACCOUNT',
        payload: { ...editingAccount, ...newAccount } as Account,
      });
      showNotification({ message: 'Счет обновлен', type: 'success' });
    } else {
      const account: Account = {
        id: Date.now(),
        name: newAccount.name!,
        currency: newAccount.currency as Currency,
        balance: newAccount.balance!,
        type: newAccount.type as 'bank' | 'cash' | 'card',
        description: newAccount.description,
      };
      dispatch({ type: 'ADD_ACCOUNT', payload: account });
      showNotification({ message: 'Счет добавлен', type: 'success' });
    }

    setIsAccountModalOpen(false);
  };

  // Форматирование суммы
  const formatAmount = (amount: number, currency: Currency) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Шапка */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Финансы</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="secondary" onClick={handleCreateAccount} className="flex-1 sm:flex-initial text-sm sm:text-base">
              <span className="hidden sm:inline">Добавить счет</span>
              <span className="sm:hidden">Счет</span>
            </Button>
            <Button onClick={handleCreateTransaction} className="flex-1 sm:flex-initial text-sm sm:text-base">
              <span className="hidden sm:inline">+ Добавить транзакцию</span>
              <span className="sm:hidden">+ Транзакция</span>
            </Button>
          </div>
        </div>

        {/* Вкладки */}
        <div className="flex gap-2 sm:gap-4 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-2 px-2 sm:px-3 font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'summary'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Сводный отчет
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`pb-2 px-2 sm:px-3 font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'income'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Поступления
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`pb-2 px-2 sm:px-3 font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'expense'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Расходы
          </button>
        </div>
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-auto p-3 sm:p-6">
        {/* Сводный отчет */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Статистика по валютам */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['KZT', 'USD', 'RUB', 'EUR'] as Currency[]).map(currency => {
                const stats = statistics.month[currency];
                return (
                  <div key={currency} className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600 mb-1">{currency}</div>
                    <div className="text-2xl font-bold text-gray-900 mb-3">
                      {formatAmount(stats.profit, currency)}
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <div className="text-green-600">↑ {formatAmount(stats.income, currency)}</div>
                        <div className="text-gray-500">Доходы</div>
                      </div>
                      <div>
                        <div className="text-red-600">↓ {formatAmount(stats.expense, currency)}</div>
                        <div className="text-gray-500">Расходы</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Структура расходов */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Структура расходов</h3>
              <div className="space-y-3">
                {expenseStructure.length === 0 ? (
                  <p className="text-gray-500">Нет данных</p>
                ) : (
                  expenseStructure.map(item => (
                    <div key={item.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{item.category}</span>
                        <span className="font-medium">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatAmount(item.amount, 'KZT')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Счета */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Счета</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.accounts.length === 0 ? (
                  <p className="text-gray-500">Счета не добавлены</p>
                ) : (
                  state.accounts.map(account => (
                    <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-gray-900">{account.name}</div>
                          <div className="text-xs text-gray-500">{account.type}</div>
                        </div>
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {account.currency}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatAmount(account.balance, account.currency)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Список транзакций (для поступлений и расходов) */}
        {(activeTab === 'income' || activeTab === 'expense') && (
          <div className="space-y-4">
            {/* Фильтры */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Поиск..."
                  value={searchQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.currency}
                  onChange={e => setFilters({ ...filters, currency: e.target.value as Currency | '' })}
                >
                  <option value="">Все валюты</option>
                  <option value="KZT">KZT</option>
                  <option value="USD">USD</option>
                  <option value="RUB">RUB</option>
                  <option value="EUR">EUR</option>
                </select>
                <Input
                  type="date"
                  placeholder="С"
                  value={filters.startDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, startDate: e.target.value })}
                />
                <Input
                  type="date"
                  placeholder="По"
                  value={filters.endDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Таблица транзакций */}
            <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Описание
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Категория
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Счет
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сумма
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        Нет транзакций
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(transaction => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.date).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>{transaction.description}</div>
                          {transaction.counterparty && (
                            <div className="text-xs text-gray-500">{transaction.counterparty}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.account}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span
                            className={
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatAmount(transaction.amount, transaction.currency)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно транзакции */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        title={editingTransaction ? 'Редактировать транзакцию' : 'Добавить транзакцию'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newTransaction.type}
                onChange={e =>
                  setNewTransaction({ ...newTransaction, type: e.target.value as TransactionType })
                }
              >
                <option value="income">Доход</option>
                <option value="expense">Расход</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newTransaction.currency}
                onChange={e =>
                  setNewTransaction({ ...newTransaction, currency: e.target.value as Currency })
                }
              >
                <option value="KZT">KZT</option>
                <option value="USD">USD</option>
                <option value="RUB">RUB</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newTransaction.category}
              onChange={e =>
                setNewTransaction({
                  ...newTransaction,
                  category: e.target.value as TransactionCategory,
                })
              }
            >
              <option value="Доходы от услуг">Доходы от услуг</option>
              <option value="Операционные расходы">Операционные расходы</option>
              <option value="Инвестиции">Инвестиции</option>
              <option value="Налоги">Налоги</option>
              <option value="Зарплаты">Зарплаты</option>
              <option value="Аренда">Аренда</option>
              <option value="Маркетинг">Маркетинг</option>
              <option value="Прочее">Прочее</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Сумма *</label>
            <Input
              type="number"
              value={newTransaction.amount || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) || 0 })
              }
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание *</label>
            <Input
              value={newTransaction.description}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              placeholder="Описание транзакции"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
            <Input
              type="date"
              value={newTransaction.date}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTransaction({ ...newTransaction, date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Счет</label>
            <Input
              value={newTransaction.account}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTransaction({ ...newTransaction, account: e.target.value })}
              placeholder="Наименование счета"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Контрагент</label>
            <Input
              value={newTransaction.counterparty}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewTransaction({ ...newTransaction, counterparty: e.target.value })
              }
              placeholder="ИП Иванов"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Проект</label>
            <Input
              value={newTransaction.project}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTransaction({ ...newTransaction, project: e.target.value })}
              placeholder="Название проекта"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={() => setIsTransactionModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveTransaction}>
              {editingTransaction ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно счета */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        title={editingAccount ? 'Редактировать счет' : 'Добавить счет'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <Input
              value={newAccount.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAccount({ ...newAccount, name: e.target.value })}
              placeholder="Основной счет"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newAccount.type}
                onChange={e =>
                  setNewAccount({ ...newAccount, type: e.target.value as 'bank' | 'cash' | 'card' })
                }
              >
                <option value="bank">Банк</option>
                <option value="cash">Наличные</option>
                <option value="card">Карта</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newAccount.currency}
                onChange={e => setNewAccount({ ...newAccount, currency: e.target.value as Currency })}
              >
                <option value="KZT">KZT</option>
                <option value="USD">USD</option>
                <option value="RUB">RUB</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Начальный баланс</label>
            <Input
              type="number"
              value={newAccount.balance || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <Input
              value={newAccount.description}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAccount({ ...newAccount, description: e.target.value })}
              placeholder="Описание счета"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={() => setIsAccountModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveAccount}>
              {editingAccount ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FinancesPage;
