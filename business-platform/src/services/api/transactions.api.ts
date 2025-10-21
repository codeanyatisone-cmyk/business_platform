import { supabase } from '../../config/supabase';
import { Transaction, Currency, TransactionType } from '../../types';

export class TransactionsAPI {
  static async getAll(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        creator:employees!transactions_created_by_id_fkey(id, name)
      `)
      .order('date', { ascending: false });

    if (error) throw error;
    
    return data.map(this.mapToTransaction);
  }

  static async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        creator:employees!transactions_created_by_id_fkey(id, name)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    
    return data.map(this.mapToTransaction);
  }

  static async create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'createdBy'>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        date: transaction.date,
        project: transaction.project || null,
        counterparty: transaction.counterparty || null,
        account: transaction.account,
        created_by_id: transaction.createdById,
        tags: transaction.tags || null,
      })
      .select(`
        *,
        creator:employees!transactions_created_by_id_fkey(id, name)
      `)
      .single();

    if (error) throw error;
    
    return this.mapToTransaction(data);
  }

  static async update(id: number, updates: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        ...(updates.type && { type: updates.type }),
        ...(updates.category && { category: updates.category }),
        ...(updates.amount !== undefined && { amount: updates.amount }),
        ...(updates.currency && { currency: updates.currency }),
        ...(updates.description && { description: updates.description }),
        ...(updates.date && { date: updates.date }),
        ...(updates.project !== undefined && { project: updates.project }),
        ...(updates.counterparty !== undefined && { counterparty: updates.counterparty }),
        ...(updates.account && { account: updates.account }),
        ...(updates.tags !== undefined && { tags: updates.tags }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        creator:employees!transactions_created_by_id_fkey(id, name)
      `)
      .single();

    if (error) throw error;
    
    return this.mapToTransaction(data);
  }

  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private static mapToTransaction(data: any): Transaction {
    return {
      id: data.id,
      type: data.type,
      category: data.category,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      date: data.date,
      project: data.project,
      counterparty: data.counterparty,
      account: data.account,
      createdBy: data.creator.name,
      createdById: data.creator.id,
      createdAt: data.created_at,
      tags: data.tags || [],
    };
  }
}

