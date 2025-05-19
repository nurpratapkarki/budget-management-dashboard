export type MoodType = 'happy' | 'neutral' | 'sad' | 'stressed' | 'excited';

export interface Mood {
  id: string;
  date: Date;
  mood: MoodType;
  note?: string;
}

export type ExpenseCategoryType = 
  | 'housing' 
  | 'food' 
  | 'transportation' 
  | 'utilities' 
  | 'healthcare' 
  | 'entertainment' 
  | 'shopping' 
  | 'personal' 
  | 'education' 
  | 'other';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategoryType;
  description: string;
  date: Date;
}

export interface Budget {
  id: string;
  category: ExpenseCategoryType;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  category?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  topExpenseCategories: {
    category: ExpenseCategoryType;
    amount: number;
    percentage: number;
  }[];
}

// Supabase Authentication Types
export interface UserSession {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
      name?: string;
    };
  };
  access_token: string;
  refresh_token: string;
}

// Expense types for database
export interface DbExpense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
}

// Budget types for database
export interface DbBudget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  current_amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  created_at: string;
}

// Income types for database
export interface DbIncome {
  id: string;
  user_id: string;
  amount: number;
  source?: string;
  period: 'weekly' | 'monthly' | 'yearly';
  created_at: string;
}
