/**
 * Централизованный API клиент для всех запросов к Supabase
 */

import { EmployeesAPI } from './employees.api';
import { TransactionsAPI } from './transactions.api';
import { companiesAPI } from './companies.api';

export { EmployeesAPI, TransactionsAPI, companiesAPI };

// API Client для управления всеми API
export class APIClient {
  static employees = EmployeesAPI;
  static transactions = TransactionsAPI;
  static companies = companiesAPI;
}

// Экспортируем для удобства
export const API = APIClient;

