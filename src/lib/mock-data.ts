
import { Budget, Expense, ExpenseCategoryType, FinancialSummary, Mood, MoodType, Task } from '@/lib/types';

export const generateRandomId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

const today = new Date();
const lastMonth = new Date(today);
lastMonth.setMonth(lastMonth.getMonth() - 1);

const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Mock expense data
export const mockExpenses: Expense[] = [
  {
    id: generateRandomId(),
    amount: 1200,
    category: 'housing',
    description: 'Monthly rent',
    date: new Date(today.getFullYear(), today.getMonth(), 1),
  },
  {
    id: generateRandomId(),
    amount: 85.75,
    category: 'utilities',
    description: 'Electricity bill',
    date: new Date(today.getFullYear(), today.getMonth(), 5),
  },
  {
    id: generateRandomId(),
    amount: 120.50,
    category: 'food',
    description: 'Weekly grocery shopping',
    date: new Date(today.getFullYear(), today.getMonth(), 7),
  },
  {
    id: generateRandomId(),
    amount: 35.99,
    category: 'entertainment',
    description: 'Movie tickets',
    date: new Date(today.getFullYear(), today.getMonth(), 12),
  },
  {
    id: generateRandomId(),
    amount: 50,
    category: 'transportation',
    description: 'Gas',
    date: new Date(today.getFullYear(), today.getMonth(), 14),
  },
  {
    id: generateRandomId(),
    amount: 60.25,
    category: 'shopping',
    description: 'New clothes',
    date: new Date(today.getFullYear(), today.getMonth(), 18),
  },
  {
    id: generateRandomId(),
    amount: 95,
    category: 'healthcare',
    description: 'Doctor appointment',
    date: new Date(today.getFullYear(), today.getMonth(), 20),
  },
  {
    id: generateRandomId(),
    amount: 45.30,
    category: 'food',
    description: 'Dinner with friends',
    date: new Date(today.getFullYear(), today.getMonth(), 22),
  },
];

// Mock budget data
export const mockBudgets: Budget[] = [
  {
    id: generateRandomId(),
    category: 'housing',
    amount: 1300,
    spent: 1200,
    period: 'monthly',
  },
  {
    id: generateRandomId(),
    category: 'food',
    amount: 500,
    spent: 350,
    period: 'monthly',
  },
  {
    id: generateRandomId(),
    category: 'utilities',
    amount: 200,
    spent: 185,
    period: 'monthly',
  },
  {
    id: generateRandomId(),
    category: 'transportation',
    amount: 150,
    spent: 100,
    period: 'monthly',
  },
  {
    id: generateRandomId(),
    category: 'entertainment',
    amount: 200,
    spent: 150,
    period: 'monthly',
  },
  {
    id: generateRandomId(),
    category: 'healthcare',
    amount: 100,
    spent: 95,
    period: 'monthly',
  },
  {
    id: generateRandomId(),
    category: 'shopping',
    amount: 300,
    spent: 200,
    period: 'monthly',
  },
];

// Mock tasks data
export const mockTasks: Task[] = [
  {
    id: generateRandomId(),
    title: 'Pay rent',
    description: 'Transfer money to landlord',
    completed: true,
    due_date: new Date(today.getFullYear(), today.getMonth(), 1),
    priority: 'high',
    category: 'finance',
  },
  {
    id: generateRandomId(),
    title: 'Create monthly budget',
    description: 'Plan expenses for next month',
    completed: false,
    due_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
    priority: 'high',
    category: 'finance',
  },
  {
    id: generateRandomId(),
    title: 'Review investment portfolio',
    completed: false,
    due_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
    priority: 'medium',
    category: 'finance',
  },
  {
    id: generateRandomId(),
    title: 'Research savings accounts',
    description: 'Find better interest rates',
    completed: false,
    due_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
    priority: 'low',
    category: 'finance',
  },
  {
    id: generateRandomId(),
    title: 'Cancel unused subscriptions',
    completed: false,
    due_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
    priority: 'medium',
    category: 'finance',
  },
];

// Mock mood data
const moodTypes: MoodType[] = ['happy', 'neutral', 'sad', 'stressed', 'excited'];

export const mockMoods: Mood[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  
  return {
    id: generateRandomId(),
    date,
    mood: moodTypes[Math.floor(Math.random() * moodTypes.length)],
    note: i % 5 === 0 ? 'Made good progress on my budget goals' : undefined,
  };
});

// Financial summary
export const mockFinancialSummary: FinancialSummary = {
  totalIncome: 3500,
  totalExpenses: 2350,
  netSavings: 1150,
  topExpenseCategories: [
    {
      category: 'housing',
      amount: 1200,
      percentage: 51,
    },
    {
      category: 'food',
      amount: 350,
      percentage: 15,
    },
    {
      category: 'utilities',
      amount: 185,
      percentage: 8,
    },
    {
      category: 'entertainment',
      amount: 150,
      percentage: 6,
    },
    {
      category: 'transportation',
      amount: 100,
      percentage: 4,
    },
  ],
};

// Categories data for charts
export const expensesByCategory = [
  { category: 'Housing', amount: 1200 },
  { category: 'Food', amount: 350 },
  { category: 'Utilities', amount: 185 },
  { category: 'Entertainment', amount: 150 },
  { category: 'Transportation', amount: 100 },
  { category: 'Healthcare', amount: 95 },
  { category: 'Shopping', amount: 200 },
  { category: 'Other', amount: 70 },
];

// Category colors
export const categoryColors: Record<ExpenseCategoryType, string> = {
  housing: '#4CAF50',
  food: '#2196F3',
  transportation: '#FF9800',
  utilities: '#9C27B0',
  healthcare: '#F44336',
  entertainment: '#3F51B5',
  shopping: '#E91E63',
  personal: '#607D8B',
  education: '#00BCD4',
  other: '#795548',
};

// Monthly expenses data for line chart
export const monthlyExpensesData = [
  { month: 'Jan', amount: 2100 },
  { month: 'Feb', amount: 2300 },
  { month: 'Mar', amount: 2000 },
  { month: 'Apr', amount: 2780 },
  { month: 'May', amount: 1890 },
  { month: 'Jun', amount: 2390 },
  { month: 'Jul', amount: 2490 },
  { month: 'Aug', amount: 2200 },
  { month: 'Sep', amount: 2300 },
  { month: 'Oct', amount: 2150 },
  { month: 'Nov', amount: 2350 },
  { month: 'Dec', amount: 2500 },
];

// Helper function to get category name with capitalized first letter
export const getCategoryName = (category: ExpenseCategoryType): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

// Task completion data
export const taskCompletionData = [
  { name: 'Completed', value: 12 },
  { name: 'Pending', value: 8 },
];

// Mood distribution data
export const moodDistributionData = [
  { name: 'Happy', value: 8 },
  { name: 'Neutral', value: 10 },
  { name: 'Sad', value: 3 },
  { name: 'Stressed', value: 5 },
  { name: 'Excited', value: 4 },
];

// Budget vs actual spending
export const budgetVsActualData = mockBudgets.map(budget => ({
  name: getCategoryName(budget.category),
  budget: budget.amount,
  spent: budget.spent
}));
