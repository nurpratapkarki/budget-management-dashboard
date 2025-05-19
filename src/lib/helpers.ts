
import { format } from "date-fns";
import { categoryColors, getCategoryName } from "./mock-data";
import { Budget, ExpenseCategoryType } from "./types";

// Format amount as currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NPR',
  }).format(amount);
};

// Format date to string
export const formatDate = (date: Date, formatStr: string = 'MMM dd, yyyy'): string => {
  return format(date, formatStr);
};

// Calculate budget progress percentage
export const calculateBudgetProgress = (spent: number, total: number): number => {
  if (total === 0) return 0;
  const percentage = (spent / total) * 100;
  return Math.min(Math.round(percentage), 100);
};

// Get color based on budget progress
export const getBudgetStatusColor = (budget: Budget): string => {
  const percentage = calculateBudgetProgress(budget.spent, budget.amount);
  
  if (percentage >= 90) return 'budget-low';
  if (percentage >= 75) return 'budget-medium';
  return 'budget-high';
};

// Get color for expense category
export const getCategoryColor = (category: ExpenseCategoryType): string => {
  return categoryColors[category] || '#607D8B';
};

// Format category for display
export const formatCategory = (category: ExpenseCategoryType): string => {
  return getCategoryName(category);
};

// Calculate remaining days in current month
export const daysLeftInMonth = (): number => {
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return lastDayOfMonth - today.getDate();
};

// Calculate percentage change
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 100;
  return Math.round(((current - previous) / previous) * 100);
};
