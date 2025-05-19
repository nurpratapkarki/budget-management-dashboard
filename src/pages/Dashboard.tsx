import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ExpensePieChart } from "@/components/dashboard/ExpensePieChart";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { TasksList } from "@/components/dashboard/TasksList";
import { MoodTracker } from "@/components/dashboard/MoodTracker";
import { IncomeCard } from "@/components/dashboard/IncomeCard";
import { FriendlyLoansSummary } from "@/components/dashboard/FriendlyLoansSummary";
import { PieChart, BarChart, Calendar } from "lucide-react";
import { formatCurrency, daysLeftInMonth } from "@/lib/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { expensesService, incomeService } from "@/lib/supabase";

const Dashboard: React.FC = () => {
  const [financialSummary, setFinancialSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
  });
  
  const { data: monthlyExpenses = [], isLoading: loadingMonthlyExpenses } = useQuery({
    queryKey: ['monthlyExpenses'],
    queryFn: expensesService.getMonthlyExpenses
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: expensesService.getAll
  });

  const { data: totalIncome = 0 } = useQuery({
    queryKey: ['totalIncome'],
    queryFn: incomeService.getTotalIncome
  });

  useEffect(() => {
    if (expenses) {
      const totalExp = expenses.reduce((total: number, expense: any) => total + Number(expense.amount), 0);
      setFinancialSummary({
        totalIncome: totalIncome,
        totalExpenses: totalExp,
        netSavings: totalIncome - totalExp
      });
    }
  }, [expenses, totalIncome]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Welcome to your financial overview
        </div>
      </div>
      
      {/* Row 1: Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(financialSummary.totalIncome)}
          icon={<BarChart className="h-5 w-5" />}
          description="per month"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(financialSummary.totalExpenses)}
          icon={<BarChart className="h-5 w-5" />}
          description="this month"
        />
        <StatCard
          title="Net Savings"
          value={formatCurrency(financialSummary.netSavings)}
          description={financialSummary.totalIncome ? 
            `${Math.round((financialSummary.netSavings / financialSummary.totalIncome) * 100)}% of income` : 
            "Add income to see percentage"}
        />
        <StatCard
          title="Days Left in Month"
          value={daysLeftInMonth()}
          icon={<Calendar className="h-5 w-5" />}
          description="to complete your budgets"
        />
      </div>
      
      {/* Row 2: Income & Loans */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <IncomeCard className="h-full md:col-span-1 lg:col-span-2 card-hover" />
        <FriendlyLoansSummary className="h-full md:col-span-1 lg:col-span-2 card-hover" />
      </div>
      
      {/* Row 3: Expenses Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Expenses Chart */}
        <div className="h-full md:col-span-1 lg:col-span-2 card-hover">
          <Card className="h-full">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Monthly Expenses</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={loadingMonthlyExpenses ? [] : monthlyExpenses}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: 'var(--foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis 
                      tick={{ fill: 'var(--foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`$${value}`, 'Amount']}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{ 
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#4CAF50"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Monthly Expenses"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        <ExpensePieChart className="h-full md:col-span-1 lg:col-span-2 card-hover" />
      </div>
      
      {/* Row 4: Utilities */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <BudgetProgress className="h-full card-hover lg:col-span-1" />
        <TasksList className="h-full card-hover lg:col-span-1" />
        
      </div>
      <div className="h-full card-hover lg:col-span-1">
            <MoodTracker />
        </div>
    </div>
  );
};

export default Dashboard;
