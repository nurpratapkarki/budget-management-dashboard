
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
