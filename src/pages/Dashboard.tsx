
import React from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ExpenseBarChart } from "@/components/dashboard/ExpenseBarChart";
import { ExpensePieChart } from "@/components/dashboard/ExpensePieChart";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { TasksList } from "@/components/dashboard/TasksList";
import { MoodTracker } from "@/components/dashboard/MoodTracker";
import { PieChart, BarChart, Calendar } from "lucide-react";
import { mockFinancialSummary } from "@/lib/mock-data";
import { formatCurrency, daysLeftInMonth } from "@/lib/helpers";

const Dashboard: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Welcome to your financial overview
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(mockFinancialSummary.totalIncome)}
          icon={<BarChart className="h-5 w-5" />}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(mockFinancialSummary.totalExpenses)}
          icon={<BarChart className="h-5 w-5" />}
          trend={{ value: 5, positive: false }}
        />
        <StatCard
          title="Net Savings"
          value={formatCurrency(mockFinancialSummary.netSavings)}
          description={`${Math.round((mockFinancialSummary.netSavings / mockFinancialSummary.totalIncome) * 100)}% of income`}
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          title="Days Left in Month"
          value={daysLeftInMonth()}
          icon={<Calendar className="h-5 w-5" />}
          description="to complete your budgets"
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExpenseBarChart className="h-full" />
        </div>
        <MoodTracker className="h-full" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ExpensePieChart className="h-full" />
        <BudgetProgress className="h-full" />
        <TasksList className="h-full" />
      </div>
    </div>
  );
};

export default Dashboard;
