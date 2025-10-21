import { createClient } from '@supabase/supabase-js';

// Supabase URL and API Key - добавьте эти переменные в .env файл
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Проверяем наличие credentials
const hasValidCredentials = supabaseUrl && 
                           supabaseAnonKey && 
                           !supabaseUrl.includes('placeholder') &&
                           !supabaseAnonKey.includes('placeholder');

if (!hasValidCredentials) {
  console.warn('⚠️ Supabase credentials missing or placeholder. Using mock data mode.');
}

// Создаем клиент только если есть валидные credentials
export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any; // В mock режиме клиент не используется

// Database types
export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: number;
          name: string;
          position: string;
          department: string;
          avatar: string;
          email: string | null;
          phone: string | null;
          hire_date: string;
          birth_date: string;
          status: 'active' | 'inactive' | 'terminated';
          salary: number | null;
          schedule: string;
          recruiter: string | null;
          hr: string | null;
          termination_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['employees']['Insert']>;
      };
      tasks: {
        Row: {
          id: number;
          title: string;
          description: string | null;
          product: string | null;
          status: 'new' | 'inProgress' | 'review' | 'completed' | 'postponed';
          priority: number;
          assignee_id: number;
          creator_id: number;
          due_date: string | null;
          tags: string[] | null;
          category: string | null;
          parent_task_id: number | null;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      transactions: {
        Row: {
          id: number;
          type: 'income' | 'expense';
          category: string;
          amount: number;
          currency: 'KZT' | 'USD' | 'RUB' | 'EUR';
          description: string;
          date: string;
          project: string | null;
          counterparty: string | null;
          account: string;
          created_by_id: number;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
      // Добавьте другие таблицы по аналогии
    };
  };
}

