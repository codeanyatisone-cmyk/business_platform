import { supabase } from '../../config/supabase';
import { Employee } from '../../types';

export class EmployeesAPI {
  static async getAll(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name');

    if (error) throw error;
    
    return data.map(this.mapToEmployee);
  }

  static async getById(id: number): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return this.mapToEmployee(data);
  }

  static async create(employee: Omit<Employee, 'id'>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert({
        name: employee.name,
        position: employee.position,
        department: employee.department,
        avatar: employee.avatar,
        email: employee.email || null,
        phone: employee.phone || null,
        hire_date: employee.hireDate,
        birth_date: employee.birthDate,
        status: employee.status,
        salary: employee.salary || null,
        schedule: employee.schedule,
        recruiter: employee.recruiter || null,
        hr: employee.hr || null,
        termination_date: employee.terminationDate || null,
      })
      .select()
      .single();

    if (error) throw error;
    
    return this.mapToEmployee(data);
  }

  static async update(id: number, updates: Partial<Employee>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.position && { position: updates.position }),
        ...(updates.department && { department: updates.department }),
        ...(updates.avatar && { avatar: updates.avatar }),
        ...(updates.email !== undefined && { email: updates.email }),
        ...(updates.phone !== undefined && { phone: updates.phone }),
        ...(updates.hireDate && { hire_date: updates.hireDate }),
        ...(updates.birthDate && { birth_date: updates.birthDate }),
        ...(updates.status && { status: updates.status }),
        ...(updates.salary !== undefined && { salary: updates.salary }),
        ...(updates.schedule && { schedule: updates.schedule }),
        ...(updates.recruiter !== undefined && { recruiter: updates.recruiter }),
        ...(updates.hr !== undefined && { hr: updates.hr }),
        ...(updates.terminationDate !== undefined && { termination_date: updates.terminationDate }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return this.mapToEmployee(data);
  }

  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private static mapToEmployee(data: any): Employee {
    return {
      id: data.id,
      name: data.name,
      position: data.position,
      department: data.department,
      avatar: data.avatar,
      email: data.email,
      phone: data.phone,
      hireDate: data.hire_date,
      birthDate: data.birth_date,
      status: data.status,
      salary: data.salary,
      schedule: data.schedule,
      recruiter: data.recruiter,
      hr: data.hr,
      terminationDate: data.termination_date,
    };
  }
}

