import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { DbExpense, DbBudget, DbIncome } from "@/lib/types";

// Use the actual Supabase URL and key
const supabaseUrl = "https://jeiwmghpozanqqqixjrj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplaXdtZ2hwb3phbnFxcWl4anJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Mzc3ODMsImV4cCI6MjA2MzIxMzc4M30.t5IVGUGIZxnYgtH94CuwKv3Ju0iZti90aQbUo2q8Hk8";

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  }
});

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
  },

  async getMonthlyExpenses() {
    const { data, error } = await supabase
      .from('expenses')
      .select('amount, date')
      .order('date', { ascending: true });
    
    if (error) {
      toast.error('Failed to load monthly expenses');
      throw error;
    }

    // Process data to get monthly totals
    const monthlyData = data.reduce((acc: Record<string, number>, expense) => {
      const month = new Date(expense.date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + Number(expense.amount);
      return acc;
    }, {});

    return Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));
  },

  async getExpensesByCategory() {
    const { data, error } = await supabase
      .from('expenses')
      .select('amount, category');
    
    if (error) {
      toast.error('Failed to load expense categories');
      throw error;
    }

    // Process data to get category totals
    const categoryData = data.reduce((acc: Record<string, number>, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {});

    return Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete expense');
      throw error;
    }
    
    toast.success('Expense deleted successfully');
    return true;
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
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete budget');
      throw error;
    }
    
    toast.success('Budget deleted successfully');
    return true;
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
  },

  async update(id: string, task: any) {
    const { data, error } = await supabase
      .from('tasks')
      .update(task)
      .eq('id', id)
      .select();
    
    if (error) {
      toast.error('Failed to update task');
      throw error;
    }
    
    toast.success('Task updated successfully');
    return data[0];
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete task');
      throw error;
    }
    
    toast.success('Task deleted successfully');
    return true;
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
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('moods')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete mood record');
      throw error;
    }
    
    toast.success('Mood record deleted successfully');
    return true;
  }
};

// Database functions for income
export const incomeService = {
  async getAll() {
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load income data');
      throw error;
    }
    return data;
  },

  async getTotalIncome() {
    const { data, error } = await supabase
      .from('incomes')
      .select('amount, period')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load income data');
      throw error;
    }

    if (!data || data.length === 0) {
      return 0; // No income data yet
    }

    // Calculate total monthly income (convert weekly to monthly and yearly to monthly)
    return data.reduce((total, income) => {
      let amount = Number(income.amount);
      if (income.period === 'weekly') {
        amount = amount * 4; // Approximate monthly equivalent
      } else if (income.period === 'yearly') {
        amount = amount / 12; // Monthly equivalent
      }
      return total + amount;
    }, 0);
  },

  async create(income: Omit<DbIncome, 'id' | 'created_at' | 'user_id'>) {
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from('incomes')
      .insert([{
        ...income,
        user_id: user?.id
      }])
      .select();
    
    if (error) {
      toast.error('Failed to add income');
      throw error;
    }
    
    toast.success('Income added successfully');
    return data[0];
  },

  async update(id: string, income: Partial<Omit<DbIncome, 'id' | 'created_at' | 'user_id'>>) {
    const { data, error } = await supabase
      .from('incomes')
      .update(income)
      .eq('id', id)
      .select();
    
    if (error) {
      toast.error('Failed to update income');
      throw error;
    }
    
    toast.success('Income updated successfully');
    return data[0];
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete income record');
      throw error;
    }
    
    toast.success('Income record deleted successfully');
    return true;
  }
};

// Database functions for Friends
export const friendsService = {
  async getAllFriends() {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      toast.error('Failed to load friends');
      throw error;
    }
    return data;
  },

  async createFriend(friendData: { name: string; contact_number?: string }) {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('friends')
      .insert([{ ...friendData, user_id: user?.id }])
      .select()
      .single();
    if (error) {
      toast.error('Failed to create friend');
      throw error;
    }
    return data;
  },
  
  async getFriendByName(name: string) {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('friends')
      .select('id')
      .eq('user_id', user?.id)
      .eq('name', name)
      .maybeSingle(); // Use maybeSingle as friend might not exist
    if (error) {
      // Don't toast error here, as not finding is a valid case for checking
      console.error('Error checking for friend:', error);
      throw error;
    }
    return data; // Returns friend object with id or null
  }
};

// Database functions for Friendly Loans (Updated)
export const friendlyLoansService = {
  // --- Loan Functions ---
  async getAllLoans() {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        repayments(*),
        friends (id, name, contact_number)
      `)
      .order('loan_date', { ascending: false });
    
    if (error) {
      toast.error('Failed to load friendly loans');
      throw error;
    }
    return data;
  },

  async getLoanById(id: string) {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        repayments(*),
        friends (id, name, contact_number)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      toast.error('Failed to load loan details');
      throw error;
    }
    return data;
  },

  async createLoan(loanData: any, friend_id: string) {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('loans')
      .insert([{ ...loanData, user_id: user?.id, friend_id }])
      .select(`
        *,
        repayments(*),
        friends (id, name, contact_number)
      `)
      .single();
      
    if (error) {
      toast.error('Failed to create loan');
      throw error;
    }
    toast.success('Loan added successfully');
    return data;
  },

  async updateLoan(id: string, loanData: any, friend_id?: string) { // friend_id is optional on update
    const updatePayload = { ...loanData };
    if (friend_id) {
      updatePayload.friend_id = friend_id;
    }

    const { data, error } = await supabase
      .from('loans')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        repayments(*),
        friends (id, name, contact_number)
      `)
      .single();
      
    if (error) {
      toast.error('Failed to update loan');
      throw error;
    }
    toast.success('Loan updated successfully');
    return data;
  },

  async deleteLoan(id: string) {
    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id);
      
    if (error) {
      toast.error('Failed to delete loan');
      throw error;
    }
    toast.success('Loan deleted successfully');
    return true;
  },

  // --- Repayment Functions ---
  async addRepayment(repaymentData: any) {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('repayments')
      .insert([{ ...repaymentData, user_id: user?.id }])
      .select()
      .single();
      
    if (error) {
      toast.error('Failed to add repayment');
      throw error;
    }
    toast.success('Repayment added successfully');
    await this.updateLoanStatus(repaymentData.loan_id);
    return data;
  },

  async deleteRepayment(id: string, loan_id: string) {
    const { error } = await supabase
      .from('repayments')
      .delete()
      .eq('id', id);
      
    if (error) {
      toast.error('Failed to delete repayment');
      throw error;
    }
    toast.success('Repayment deleted successfully');
    await this.updateLoanStatus(loan_id);
    return true;
  },
  
  async updateLoanStatus(loanId: string) {
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('amount, repayments(amount)')
      .eq('id', loanId)
      .single();

    if (loanError || !loan) {
      console.error('Error fetching loan for status update:', loanError);
      return;
    }

    const totalRepaid = loan.repayments.reduce((sum: number, r: any) => sum + Number(r.amount), 0);
    let newStatus = 'pending';

    if (totalRepaid >= Number(loan.amount)) {
      newStatus = 'paid';
    } else if (totalRepaid > 0) {
      newStatus = 'partially_paid';
    }
    
    const { error: updateError } = await supabase
      .from('loans')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', loanId);

    if (updateError) {
      toast.error('Failed to update loan status');
      console.error('Error updating loan status:', updateError);
    }
  }
};
