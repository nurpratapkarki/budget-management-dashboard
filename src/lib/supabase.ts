
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are not properly configured');
  toast.error('Database connection failed. Please check your configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if user is logged in
export const isLoggedIn = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Database functions for expenses
export const expensesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      toast.error('Failed to load expenses');
      throw error;
    }
    return data;
  },

  async create(expense: Omit<DbExpense, 'id' | 'created_at' | 'user_id'>) {
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        ...expense,
        user_id: user?.id
      }])
      .select();
    
    if (error) {
      toast.error('Failed to create expense');
      throw error;
    }
    
    toast.success('Expense added successfully');
    return data[0];
  }
};

// Database functions for budgets
export const budgetsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('budgets')
      .select('*');
    
    if (error) {
      toast.error('Failed to load budgets');
      throw error;
    }
    return data;
  },

  async create(budget: Omit<DbBudget, 'id' | 'created_at' | 'user_id'>) {
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from('budgets')
      .insert([{
        ...budget,
        user_id: user?.id
      }])
      .select();
    
    if (error) {
      toast.error('Failed to create budget');
      throw error;
    }
    
    toast.success('Budget added successfully');
    return data[0];
  }
};

// Database functions for tasks
export const tasksService = {
  async getAll() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load tasks');
      throw error;
    }
    return data;
  },

  async create(task: any) {
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...task,
        user_id: user?.id
      }])
      .select();
    
    if (error) {
      toast.error('Failed to create task');
      throw error;
    }
    
    toast.success('Task added successfully');
    return data[0];
  }
};

// Database functions for moods
export const moodsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('moods')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      toast.error('Failed to load mood data');
      throw error;
    }
    return data;
  },

  async create(mood: any) {
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from('moods')
      .insert([{
        ...mood,
        user_id: user?.id
      }])
      .select();
    
    if (error) {
      toast.error('Failed to record mood');
      throw error;
    }
    
    toast.success('Mood recorded successfully');
    return data[0];
  }
};

// Import types from types file
import { DbExpense, DbBudget } from "@/lib/types";
